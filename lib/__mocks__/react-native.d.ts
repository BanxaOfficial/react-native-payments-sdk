/**
 * Mock for react-native in Jest tests.
 */
export declare const Alert: {
    alert: jest.Mock<any, any, any>;
    prompt: jest.Mock<any, any, any>;
};
export declare const View = "View";
export declare const Text = "Text";
export declare const Modal = "Modal";
export declare const TouchableOpacity = "TouchableOpacity";
export declare const StyleSheet: {
    create: (styles: Record<string, unknown>) => Record<string, unknown>;
};
/** Present so ensurePrimerNativeModule() passes in tests when using Primer checkout flow. */
export declare const NativeModules: {
    NativePrimer: {};
};
