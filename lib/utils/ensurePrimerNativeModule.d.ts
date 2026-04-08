/**
 * Verifies the Primer native module is linked before loading @primer-io/react-native.
 * That package creates a NativeEventEmitter(NativeModules.NativePrimer) at import time;
 * if the native module is missing you get "cannot read property primer of undefined"
 * and "new NativeEventEmitter() requires a non-null argument".
 * Call this before requiring @primer-io/react-native when using the Primer checkout flow.
 */
export declare function ensurePrimerNativeModule(): void;
