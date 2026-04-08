"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutWebView = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
// react-native-webview may be undefined on web (e.g. RNW or Expo web)
let WebViewComponent;
try {
    // @ts-ignore - react-native-webview types may not be available
    const webview = require('react-native-webview');
    WebViewComponent = webview?.WebView ?? webview?.default;
}
catch {
    WebViewComponent = undefined;
}
const isWeb = react_native_1.Platform.OS === 'web';
const CheckoutWebView = (props) => {
    const { checkoutUrl, visible, onClose, onNavigationStateChange, onSuccess, onFailure, onCancelled, returnUrlOnSuccess, returnUrlOnFailure, returnUrlOnCancelled, } = props;
    const checkUrl = react_1.default.useCallback((url) => {
        if (returnUrlOnSuccess && url.includes(returnUrlOnSuccess)) {
            onSuccess?.(url);
            onClose();
            return true;
        }
        if (returnUrlOnFailure && url.includes(returnUrlOnFailure)) {
            onFailure?.(url);
            onClose();
            return true;
        }
        if (returnUrlOnCancelled && url.includes(returnUrlOnCancelled)) {
            onCancelled?.(url);
            onClose();
            return true;
        }
        return false;
    }, [
        returnUrlOnSuccess,
        returnUrlOnFailure,
        returnUrlOnCancelled,
        onSuccess,
        onFailure,
        onCancelled,
        onClose,
    ]);
    const handleNavigationStateChange = react_1.default.useCallback((navState) => {
        const { url } = navState;
        if (checkUrl(url))
            return;
        onNavigationStateChange?.(navState);
    }, [checkUrl, onNavigationStateChange]);
    // On web, react-native-webview often isn't available or is undefined; use an iframe instead.
    const useIframe = isWeb;
    const WebViewOrFallback = WebViewComponent;
    if (!visible) {
        return null;
    }
    return (react_1.default.createElement(react_native_1.Modal, { visible: visible, animationType: "slide", presentationStyle: "pageSheet", onRequestClose: onClose },
        react_1.default.createElement(react_native_1.View, { style: styles.container },
            react_1.default.createElement(react_native_1.View, { style: styles.header },
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: onClose, style: styles.closeButton },
                    react_1.default.createElement(react_native_1.Text, { style: styles.closeButtonText }, "Close"))),
            useIframe ? (react_1.default.createElement("iframe", { title: "Checkout", src: checkoutUrl, style: { flex: 1, width: '100%', height: '100%', border: 0 } })) : WebViewOrFallback ? (react_1.default.createElement(WebViewOrFallback, { source: { uri: checkoutUrl }, onNavigationStateChange: handleNavigationStateChange, style: styles.webview, startInLoadingState: true })) : (react_1.default.createElement(react_native_1.View, { style: styles.webview },
                react_1.default.createElement(react_native_1.Text, { style: styles.fallbackText }, "WebView is not available. Install react-native-webview for native checkout."))))));
};
exports.CheckoutWebView = CheckoutWebView;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 50,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    webview: {
        flex: 1,
    },
    fallbackText: {
        padding: 16,
        textAlign: 'center',
        color: '#666',
    },
});
