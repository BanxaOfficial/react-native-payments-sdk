/**
 * Mock for @primer-io/react-native used in tests when the package is not installed.
 */
export declare const Primer: {
    configure: jest.Mock<any, any, any>;
    showUniversalCheckout: jest.Mock<any, any, any>;
    showPaymentMethod: jest.Mock<any, any, any>;
    dismiss: jest.Mock<any, any, any>;
};
export declare const HeadlessUniversalCheckout: {
    startWithClientToken: jest.Mock<any, any, any>;
    cleanUp: jest.Mock<any, any, any>;
};
export declare const SessionIntent: {
    CHECKOUT: string;
};
