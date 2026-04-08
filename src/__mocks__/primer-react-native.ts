/**
 * Mock for @primer-io/react-native used in tests when the package is not installed.
 */
export const Primer = {
  configure: jest.fn().mockResolvedValue(undefined),
  showUniversalCheckout: jest.fn().mockResolvedValue(undefined),
  showPaymentMethod: jest.fn().mockResolvedValue(undefined),
  dismiss: jest.fn().mockResolvedValue(undefined),
};

const mockPaymentMethods = [
  { paymentMethodType: 'PAYMENT_CARD', paymentMethodManagerCategories: ['RAW_DATA'] },
];

export const HeadlessUniversalCheckout = {
  startWithClientToken: jest.fn().mockImplementation((_token: string, settings: Record<string, unknown>) => {
    const cb = (settings?.headlessUniversalCheckoutCallbacks as { onAvailablePaymentMethodsLoad?: (m: unknown[]) => void })?.onAvailablePaymentMethodsLoad;
    if (cb) {
      setImmediate(() => cb(mockPaymentMethods));
    }
    return Promise.resolve(mockPaymentMethods);
  }),
  cleanUp: jest.fn().mockResolvedValue(undefined),
};

export const SessionIntent = { CHECKOUT: 'CHECKOUT' };
