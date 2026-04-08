import type { PrimerSettings } from '@primer-io/react-native';
import type { Order, PrimerCheckoutPaymentMethod } from '../types';
/** Optional callbacks for Primer checkout flows. */
export interface PrimerCheckoutCallbacks {
    onCheckoutComplete?: (checkoutData: unknown) => void;
    onError?: (error: {
        description?: string;
    }) => void;
    onDismiss?: () => void;
}
/** Options for the Primer checkout wrapper. */
export interface PrimerCheckoutWrapperOptions {
    /** Callbacks for success, error, and dismiss. */
    callbacks?: PrimerCheckoutCallbacks;
    /** Override or extend Primer settings (e.g. paymentMethodOptions.applePayOptions). */
    primerSettings?: Partial<PrimerSettings>;
}
/**
 * Wrapper around Primer Universal Checkout and Headless (Apple Pay) flows.
 * Centralizes Primer configuration and callbacks so buy/sell modules stay thin.
 */
export declare class PrimerCheckoutWrapper {
    private callbacks;
    private primerSettingsOverride;
    constructor(options?: PrimerCheckoutWrapperOptions);
    /**
     * Build base Primer settings (payment handling + Apple Pay options). Does not include callbacks.
     */
    private getBaseSettings;
    /**
     * Show Primer checkout for the given payment method / flow variant.
     * @param paymentMethod - `card` | `applePay` | `googlePay` | `universal`
     * @param options - For `card`, optional `paymentMethodType` (resolved from session if omitted).
     */
    showPrimerCheckout(clientToken: string, order: Order, paymentMethod: PrimerCheckoutPaymentMethod, options?: {
        callbacks?: PrimerCheckoutCallbacks;
        paymentMethodType?: string;
    }): Promise<Order>;
    /**
     * Show Primer Universal Checkout with the given client token.
     * Resolves with the order when the sheet is shown (order reference only; completion is via callbacks).
     * @param callbacksOverride - Optional. Use these callbacks for this call only; otherwise uses the wrapper's callbacks.
     */
    showUniversalCheckout(clientToken: string, order: Order, callbacksOverride?: PrimerCheckoutCallbacks): Promise<Order>;
    /**
     * Show Primer Universal Checkout for card only, using the given client token.
     * Resolves with the order when the sheet is shown (order reference only; completion is via callbacks).
     * @param clientToken - Primer client token from the order
     * @param order - Order to return when the sheet is shown
     * @param options - Optional. paymentMethodType if your client session uses a different type; callbacks for this call only.
     */
    showPrimerCCUniversalCheckout(clientToken: string, order: Order, options?: {
        paymentMethodType?: string;
        callbacks?: PrimerCheckoutCallbacks;
    }): Promise<Order>;
    /**
     * Show Primer Headless Checkout for Apple Pay only.
     * Uses HeadlessUniversalCheckout + NativeUIManager. Resolves with the order when checkout completes.
     * @param callbacksOverride - Optional. Use these callbacks for this call only.
     */
    showApplePayCheckout(clientToken: string, order: Order, callbacksOverride?: PrimerCheckoutCallbacks): Promise<Order>;
    /**
     * Show Primer Headless Checkout for Google Pay only.
     * Uses HeadlessUniversalCheckout + NativeUIManager. Resolves with the order when checkout completes.
     * @param callbacksOverride - Optional. Use these callbacks for this call only.
     */
    showGooglePayCheckout(clientToken: string, order: Order, callbacksOverride?: PrimerCheckoutCallbacks): Promise<Order>;
}
