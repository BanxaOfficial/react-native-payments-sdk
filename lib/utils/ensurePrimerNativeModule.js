"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensurePrimerNativeModule = ensurePrimerNativeModule;
const react_native_1 = require("react-native");
const PRIMER_MODULE_NAME = 'NativePrimer';
/**
 * Verifies the Primer native module is linked before loading @primer-io/react-native.
 * That package creates a NativeEventEmitter(NativeModules.NativePrimer) at import time;
 * if the native module is missing you get "cannot read property primer of undefined"
 * and "new NativeEventEmitter() requires a non-null argument".
 * Call this before requiring @primer-io/react-native when using the Primer checkout flow.
 */
function ensurePrimerNativeModule() {
    const primerModule = react_native_1.NativeModules != null ? react_native_1.NativeModules[PRIMER_MODULE_NAME] : null;
    if (primerModule != null) {
        return;
    }
    throw new Error('Primer native module is not linked. ' +
        'Ensure @primer-io/react-native is installed in the host app, then run "pod install" in the ios folder (iOS) and rebuild the app (Android). ' +
        'If you only need WebView checkout, use createOrder() and initializeCheckoutWebView(), or createOrderAndShowPrimerCheckout() when the order has checkoutUrl but no nativeToken (returns WebView props without loading Primer).');
}
