import { ensurePrimerNativeModule } from '../utils/ensurePrimerNativeModule';
import type { PrimerSettings } from '@primer-io/react-native';
import { SessionIntent } from '@primer-io/react-native';
import type { Order, PrimerCheckoutPaymentMethod } from '../types';

/** Optional callbacks for Primer checkout flows. */
export interface PrimerCheckoutCallbacks {
  onCheckoutComplete?: (checkoutData: unknown) => void;
  onError?: (error: { description?: string }) => void;
  onDismiss?: () => void;
}

/** Options for the Primer checkout wrapper. */
export interface PrimerCheckoutWrapperOptions {
  /** Callbacks for success, error, and dismiss. */
  callbacks?: PrimerCheckoutCallbacks;
  /** Override or extend Primer settings (e.g. paymentMethodOptions.applePayOptions). */
  primerSettings?: Partial<PrimerSettings>;
}

const DEFAULT_APPLE_PAY_OPTIONS = {
  merchantIdentifier: 'merchant.com.yourdomain',
  isCaptureBillingAddressEnabled: false,
  showApplePayForUnsupportedDevice: true,
};

const DEFAULT_GOOGLE_PAY_OPTIONS = {
  merchantName: 'Banxa',
  allowedCardNetworks: ['VISA', 'MASTERCARD'],
  isCaptureBillingAddressEnabled: false,
  isExistingPaymentMethodRequired: false,
};

/** Payment method shape returned by Headless startWithClientToken. */
interface HeadlessPaymentMethod {
  paymentMethodType: string;
  paymentMethodManagerCategories?: string[];
}

/**
 * Resolve the card payment method type from the client session via Headless (so showPaymentMethod gets the correct type).
 */
async function resolveCardPaymentMethodType(
  clientToken: string,
  HeadlessUniversalCheckout: {
    startWithClientToken: (token: string, settings: PrimerSettings) => Promise<HeadlessPaymentMethod[]>;
    cleanUp: () => Promise<void>;
  },
  baseSettings: PrimerSettings
): Promise<string> {
  return new Promise((resolve, reject) => {
    const settings: PrimerSettings = {
      ...baseSettings,
      headlessUniversalCheckoutCallbacks: {
        onAvailablePaymentMethodsLoad: async (availablePaymentMethods: HeadlessPaymentMethod[]) => {
          const cardMethod = availablePaymentMethods.find(
            (pm) =>
              pm.paymentMethodManagerCategories?.includes('CARD_COMPONENTS') ||
              (pm.paymentMethodManagerCategories?.includes('RAW_DATA') &&
                /CARD|PAYMENT_CARD/i.test(pm.paymentMethodType ?? ''))
          ) ?? availablePaymentMethods.find((pm) => pm.paymentMethodManagerCategories?.includes('RAW_DATA'));
          if (!cardMethod) {
            reject(new Error('Card payment method not found in client session. Pass paymentMethodType in options if known.'));
            return;
          }
          try {
            await HeadlessUniversalCheckout.cleanUp();
          } catch (_) {
            // ignore
          }
          resolve(cardMethod.paymentMethodType);
        },
        onError: (_error: unknown, _data: unknown) => reject(_error),
      },
    };
    HeadlessUniversalCheckout.startWithClientToken(clientToken, settings).catch(reject);
  });
}

/**
 * Wrapper around Primer Universal Checkout and Headless (Apple Pay) flows.
 * Centralizes Primer configuration and callbacks so buy/sell modules stay thin.
 */
export class PrimerCheckoutWrapper {
  private callbacks: PrimerCheckoutCallbacks;
  private primerSettingsOverride: Partial<PrimerSettings> | undefined;

  constructor(options: PrimerCheckoutWrapperOptions = {}) {
    this.callbacks = options.callbacks ?? {};
    this.primerSettingsOverride = options.primerSettings;
  }

  /**
   * Build base Primer settings (payment handling + Apple Pay options). Does not include callbacks.
   */
  private getBaseSettings(): PrimerSettings {
    return {
      paymentHandling: 'AUTO',
      paymentMethodOptions: {
        applePayOptions: {
          ...DEFAULT_APPLE_PAY_OPTIONS,
          ...this.primerSettingsOverride?.paymentMethodOptions?.applePayOptions,
        },
        googlePayOptions: {
          ...DEFAULT_GOOGLE_PAY_OPTIONS,
          ...this.primerSettingsOverride?.paymentMethodOptions?.googlePayOptions,
        },
      },
      ...this.primerSettingsOverride,
    };
  }

  /**
   * Show Primer checkout for the given payment method / flow variant.
   * @param paymentMethod - `card` | `applePay` | `googlePay` | `universal`
   * @param options - For `card`, optional `paymentMethodType` (resolved from session if omitted).
   */
  async showPrimerCheckout(
    clientToken: string,
    order: Order,
    paymentMethod: PrimerCheckoutPaymentMethod,
    options?: { callbacks?: PrimerCheckoutCallbacks; paymentMethodType?: string }
  ): Promise<Order> {
    switch (paymentMethod) {
      case 'universal':
        return this.showUniversalCheckout(clientToken, order, options?.callbacks);
      case 'card':
        return this.showPrimerCCUniversalCheckout(clientToken, order, {
          callbacks: options?.callbacks,
          paymentMethodType: options?.paymentMethodType,
        });
      case 'applePay':
        return this.showApplePayCheckout(clientToken, order, options?.callbacks);
      case 'googlePay':
        return this.showGooglePayCheckout(clientToken, order, options?.callbacks);
      default: {
        const _exhaustive: never = paymentMethod;
        throw new Error(`Unsupported Primer checkout payment method: ${String(_exhaustive)}`);
      }
    }
  }

  /**
   * Show Primer Universal Checkout with the given client token.
   * Resolves with the order when the sheet is shown (order reference only; completion is via callbacks).
   * @param callbacksOverride - Optional. Use these callbacks for this call only; otherwise uses the wrapper's callbacks.
   */
  async showUniversalCheckout(
    clientToken: string,
    order: Order,
    callbacksOverride?: PrimerCheckoutCallbacks
  ): Promise<Order> {
    ensurePrimerNativeModule();

    const { Primer } = require('@primer-io/react-native') as {
      Primer: {
        configure: (opts: PrimerSettings) => Promise<void>;
        showUniversalCheckout: (token: string) => Promise<void>;
        dismiss: () => Promise<void>;
      };
    };

    const c = callbacksOverride ?? this.callbacks;
    const primerOptions: PrimerSettings = {
      ...this.getBaseSettings(),
      onCheckoutComplete: async (data) => {
        try {
          await Primer.dismiss();
        } catch (_) {
          // ignore
        }
        c.onCheckoutComplete?.(data);
      },
      onError: (error, _checkoutData) => {
        c.onError?.(error);
      },
      onDismiss: () => {
        c.onDismiss?.();
      },
    };

    await Primer.configure(primerOptions);
    await Primer.showUniversalCheckout(clientToken);
    return order;
  }

  /**
   * Show Primer Universal Checkout for card only, using the given client token.
   * Resolves with the order when the sheet is shown (order reference only; completion is via callbacks).
   * @param clientToken - Primer client token from the order
   * @param order - Order to return when the sheet is shown
   * @param options - Optional. paymentMethodType if your client session uses a different type; callbacks for this call only.
   */
  async showPrimerCCUniversalCheckout(
    clientToken: string,
    order: Order,
    options?: { paymentMethodType?: string; callbacks?: PrimerCheckoutCallbacks }
  ): Promise<Order> {
    ensurePrimerNativeModule();

    const { Primer, HeadlessUniversalCheckout } = require('@primer-io/react-native') as {
      Primer: {
        configure: (opts: PrimerSettings) => Promise<void>;
        showUniversalCheckout: (token: string) => Promise<void>;
        showPaymentMethod: (paymentMethodType: string, intent: string, clientToken: string) => Promise<void>;
        dismiss: () => Promise<void>;
      };
      HeadlessUniversalCheckout: {
        startWithClientToken: (token: string, settings: PrimerSettings) => Promise<{ paymentMethodType: string; paymentMethodManagerCategories: string[] }[]>;
        cleanUp: () => Promise<void>;
      };
    };

    const c = options?.callbacks ?? this.callbacks;
    const primerOptions: PrimerSettings = {
      ...this.getBaseSettings(),
      onCheckoutComplete: async (data) => {
        try {
          await Primer.dismiss();
        } catch (_) {
          // ignore
        }
        c.onCheckoutComplete?.(data);
      },
      onError: (error, _checkoutData) => {
        c.onError?.(error);
      },
      onDismiss: () => {
        c.onDismiss?.();
      },
    };

    await Primer.configure(primerOptions);

    const paymentMethodType = options?.paymentMethodType ?? await resolveCardPaymentMethodType(
      clientToken,
      HeadlessUniversalCheckout,
      this.getBaseSettings()
    );

    await Primer.showPaymentMethod(paymentMethodType, SessionIntent.CHECKOUT, clientToken);
    return order;
  }

  /**
   * Show Primer Headless Checkout for Apple Pay only.
   * Uses HeadlessUniversalCheckout + NativeUIManager. Resolves with the order when checkout completes.
   * @param callbacksOverride - Optional. Use these callbacks for this call only.
   */
  async showApplePayCheckout(
    clientToken: string,
    order: Order,
    callbacksOverride?: PrimerCheckoutCallbacks
  ): Promise<Order> {
    ensurePrimerNativeModule();

    const {
      HeadlessUniversalCheckout,
      NativeUIManager,
      SessionIntent,
      Primer: PrimerAPI,
    } = require('@primer-io/react-native') as {
      HeadlessUniversalCheckout: {
        startWithClientToken: (token: string, settings: PrimerSettings) => Promise<{ paymentMethodType: string; paymentMethodManagerCategories: string[] }[]>;
        cleanUp: () => Promise<void>;
      };
      NativeUIManager: new () => { configure: (paymentMethodType: string) => Promise<void>; showPaymentMethod: (intent: string) => Promise<void> };
      SessionIntent: { CHECKOUT: string };
      Primer: { dismiss: () => Promise<void> };
    };

    const c = callbacksOverride ?? this.callbacks;
    return new Promise<Order>((resolve, reject) => {
      const settings: PrimerSettings = {
        ...this.getBaseSettings(),
        headlessUniversalCheckoutCallbacks: {
          onAvailablePaymentMethodsLoad: async (availablePaymentMethods) => {
            const applePayMethod = availablePaymentMethods.find(
              (pm) =>
                pm.paymentMethodManagerCategories?.includes('NATIVE_UI') &&
                (pm.paymentMethodType === 'APPLE_PAY' || pm.paymentMethodType?.toLowerCase().includes('apple'))
            );
            if (!applePayMethod) {
              reject(new Error('Apple Pay is not available for this order. Use paymentMethod `card` or `universal` instead.'));
              return;
            }
            try {
              const nativeUIManager = new NativeUIManager();
              await nativeUIManager.configure(applePayMethod.paymentMethodType);
              await nativeUIManager.showPaymentMethod(SessionIntent.CHECKOUT);
            } catch (err) {
              reject(err);
            }
          },
          onCheckoutComplete: async (checkoutData) => {
            try {
              await HeadlessUniversalCheckout.cleanUp();
              await PrimerAPI.dismiss();
            } catch (_) {
              // ignore
            }
            c.onCheckoutComplete?.(checkoutData);
            resolve(order);
          },
          onError: (error, _checkoutData) => {
            c.onError?.(error);
            reject(error);
          },
        },
      };

      HeadlessUniversalCheckout.startWithClientToken(clientToken, settings).catch(reject);
    });
  }

  /**
   * Show Primer Headless Checkout for Google Pay only.
   * Uses HeadlessUniversalCheckout + NativeUIManager. Resolves with the order when checkout completes.
   * @param callbacksOverride - Optional. Use these callbacks for this call only.
   */
  async showGooglePayCheckout(
    clientToken: string,
    order: Order,
    callbacksOverride?: PrimerCheckoutCallbacks
  ): Promise<Order> {
    ensurePrimerNativeModule();
    const {
      HeadlessUniversalCheckout,
      NativeUIManager,
      SessionIntent,
      Primer: PrimerAPI,
    } = require('@primer-io/react-native') as {
      HeadlessUniversalCheckout: {
        startWithClientToken: (token: string, settings: PrimerSettings) => Promise<{ paymentMethodType: string; paymentMethodManagerCategories: string[] }[]>;
        cleanUp: () => Promise<void>;
      };
      NativeUIManager: new () => { configure: (paymentMethodType: string) => Promise<void>; showPaymentMethod: (intent: string) => Promise<void> };
      SessionIntent: { CHECKOUT: string };
      Primer: { dismiss: () => Promise<void> };
    };

    const c = callbacksOverride ?? this.callbacks;
    return new Promise<Order>((resolve, reject) => {
      const settings: PrimerSettings = {
        ...this.getBaseSettings(),
        headlessUniversalCheckoutCallbacks: {
          onAvailablePaymentMethodsLoad: async (availablePaymentMethods) => {
            const googlePayMethod = availablePaymentMethods.find(
              (pm) =>
                pm.paymentMethodManagerCategories?.includes('NATIVE_UI') &&
                (pm.paymentMethodType === 'GOOGLE_PAY' || pm.paymentMethodType?.toLowerCase().includes('google'))
            );
            if (!googlePayMethod) {
              reject(new Error('Google Pay is not available for this order.' + JSON.stringify(availablePaymentMethods)));
              return;
            }
            try {
              const nativeUIManager = new NativeUIManager();
              await nativeUIManager.configure(googlePayMethod.paymentMethodType);
              await nativeUIManager.showPaymentMethod(SessionIntent.CHECKOUT);
            } catch (err) {
              reject(err);
            }
          },
          onCheckoutComplete: async (checkoutData) => {
            try {
              await HeadlessUniversalCheckout.cleanUp();
              await PrimerAPI.dismiss();
            } catch (_) {
              // ignore
            }
            c.onCheckoutComplete?.(checkoutData);
            resolve(order);
          },
          onError: (error, _checkoutData) => {
            c.onError?.(error);
            reject(error);
          },
        },
      };

      HeadlessUniversalCheckout.startWithClientToken(clientToken, settings).catch(reject);
    });
  }
}
