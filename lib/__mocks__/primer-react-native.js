"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionIntent = exports.HeadlessUniversalCheckout = exports.Primer = void 0;
/**
 * Mock for @primer-io/react-native used in tests when the package is not installed.
 */
exports.Primer = {
    configure: jest.fn().mockResolvedValue(undefined),
    showUniversalCheckout: jest.fn().mockResolvedValue(undefined),
    showPaymentMethod: jest.fn().mockResolvedValue(undefined),
    dismiss: jest.fn().mockResolvedValue(undefined),
};
const mockPaymentMethods = [
    { paymentMethodType: 'PAYMENT_CARD', paymentMethodManagerCategories: ['RAW_DATA'] },
];
exports.HeadlessUniversalCheckout = {
    startWithClientToken: jest.fn().mockImplementation((_token, settings) => {
        const cb = settings?.headlessUniversalCheckoutCallbacks?.onAvailablePaymentMethodsLoad;
        if (cb) {
            setImmediate(() => cb(mockPaymentMethods));
        }
        return Promise.resolve(mockPaymentMethods);
    }),
    cleanUp: jest.fn().mockResolvedValue(undefined),
};
exports.SessionIntent = { CHECKOUT: 'CHECKOUT' };
