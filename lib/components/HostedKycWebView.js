"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostedKycWebView = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
// react-native-webview isn't available on web (React Native Web or Expo web).
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
/** The message `type` values the hosted KYC flow posts to the page. */
const BANXA_KYC_MESSAGE_TYPES = {
    LOADING: 'banxa:loading',
    READY: 'banxa:ready',
    COMPLETE: 'banxa:kyc-complete',
    ERROR: 'banxa:error',
};
/** Forwards the page's `banxa:*` messages to the app. */
const MESSAGE_BRIDGE_SCRIPT = `
(function () {
  window.addEventListener('message', function (event) {
    var data = event && event.data;
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') return;
    if (data.type.indexOf('banxa:') !== 0) return;
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: data.type,
        status: data.status,
        code: data.code,
        message: data.message,
        origin: event.origin,
      }));
    }
  });
})();
true;
`;
/**
 * Renders the hosted KYC flow in a modal: a WebView on iOS and Android, an iframe on web.
 *
 * @param {HostedKycWebViewProps} props
 * @return {JSX.Element | null}
 */
const HostedKycWebView = (props) => {
    const { sessionUrl, expiresAt, visible, onClose, onComplete, onError, onReady, onLoading, onMessageRejected, returnUrl, onNavigationStateChange, allowedOrigins, iframeTitle, } = props;
    const completedRef = react_1.default.useRef(false);
    const acceptedOrigins = react_1.default.useMemo(() => {
        const extra = allowedOrigins ?? [];
        try {
            return [new URL(sessionUrl).origin, ...extra];
        }
        catch {
            return extra;
        }
    }, [sessionUrl, allowedOrigins]);
    const completeOnce = react_1.default.useCallback((detail) => {
        if (completedRef.current)
            return;
        completedRef.current = true;
        onComplete?.(detail);
    }, [onComplete]);
    const handleWebViewMessage = react_1.default.useCallback((event) => {
        let data = null;
        try {
            data = JSON.parse(event.nativeEvent.data);
        }
        catch {
            return;
        }
        if (!data || typeof data.type !== 'string')
            return;
        if (!data.origin || !acceptedOrigins.includes(data.origin)) {
            onMessageRejected?.('origin');
            return;
        }
        if (data.type === BANXA_KYC_MESSAGE_TYPES.COMPLETE) {
            completeOnce({ status: data.status ?? 'complete' });
            return;
        }
        if (data.type === BANXA_KYC_MESSAGE_TYPES.ERROR) {
            onError?.({ code: data.code, message: data.message ?? '' });
            return;
        }
        if (data.type === BANXA_KYC_MESSAGE_TYPES.READY) {
            onReady?.();
            return;
        }
        if (data.type === BANXA_KYC_MESSAGE_TYPES.LOADING) {
            onLoading?.();
        }
    }, [acceptedOrigins, completeOnce, onError, onReady, onLoading, onMessageRejected]);
    const checkReturnUrl = react_1.default.useCallback((url) => {
        if (returnUrl && url.includes(returnUrl)) {
            completeOnce({ status: 'complete' });
            return true;
        }
        return false;
    }, [returnUrl, completeOnce]);
    const handleNavigationStateChange = react_1.default.useCallback((navState) => {
        const { url } = navState;
        checkReturnUrl(url);
        onNavigationStateChange?.(navState);
    }, [checkReturnUrl, onNavigationStateChange]);
    // Web: the iframe posts to this page, so listen on window directly.
    react_1.default.useEffect(() => {
        if (!isWeb)
            return undefined;
        const win = globalThis.window;
        if (!win)
            return undefined;
        const listener = (event) => {
            const data = event.data;
            if (!data || typeof data !== 'object' || typeof data.type !== 'string')
                return;
            if (!data.type.startsWith('banxa:'))
                return;
            if (!acceptedOrigins.includes(event.origin)) {
                onMessageRejected?.('origin');
                return;
            }
            if (data.type === BANXA_KYC_MESSAGE_TYPES.COMPLETE) {
                completeOnce({ status: data.status ?? 'complete' });
            }
            else if (data.type === BANXA_KYC_MESSAGE_TYPES.ERROR) {
                onError?.({ code: data.code, message: data.message ?? '' });
            }
            else if (data.type === BANXA_KYC_MESSAGE_TYPES.READY) {
                onReady?.();
            }
            else if (data.type === BANXA_KYC_MESSAGE_TYPES.LOADING) {
                onLoading?.();
            }
        };
        win.addEventListener('message', listener);
        return () => win.removeEventListener('message', listener);
    }, [acceptedOrigins, completeOnce, onError, onReady, onLoading, onMessageRejected]);
    react_1.default.useEffect(() => {
        completedRef.current = false;
    }, [sessionUrl]);
    const hasExpired = react_1.default.useCallback(() => {
        if (!expiresAt)
            return false;
        const timestamp = Date.parse(expiresAt);
        if (Number.isNaN(timestamp))
            return false;
        return timestamp <= Date.now();
    }, [expiresAt]);
    const useIframe = isWeb;
    const WebViewOrFallback = WebViewComponent;
    let errorMessage = null;
    if (!sessionUrl) {
        errorMessage = 'Session URL is required';
    }
    else if (hasExpired()) {
        errorMessage = 'This verification session has expired. Request a new one to continue.';
    }
    const expiredMessage = errorMessage === 'This verification session has expired. Request a new one to continue.'
        ? errorMessage
        : null;
    react_1.default.useEffect(() => {
        if (expiredMessage) {
            onError?.({ code: 'session_expired', message: expiredMessage });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expiredMessage]);
    if (!visible) {
        return null;
    }
    return (react_1.default.createElement(react_native_1.Modal, { visible: visible, animationType: "slide", presentationStyle: "pageSheet", onRequestClose: onClose },
        react_1.default.createElement(react_native_1.View, { style: styles.container },
            react_1.default.createElement(react_native_1.View, { style: styles.header },
                react_1.default.createElement(react_native_1.TouchableOpacity, { onPress: onClose, style: styles.closeButton },
                    react_1.default.createElement(react_native_1.Text, { style: styles.closeButtonText }, "Close"))),
            errorMessage ? (react_1.default.createElement(react_native_1.View, { style: styles.errorContainer },
                react_1.default.createElement(react_native_1.Text, { style: styles.errorText }, errorMessage))) : useIframe ? (react_1.default.createElement("iframe", { title: iframeTitle ?? 'Banxa verification', src: sessionUrl, allow: "camera; microphone", style: { flex: 1, width: '100%', height: '100%', border: 0 } })) : WebViewOrFallback ? (react_1.default.createElement(WebViewOrFallback, { source: { uri: sessionUrl }, onNavigationStateChange: handleNavigationStateChange, onMessage: handleWebViewMessage, injectedJavaScriptBeforeContentLoaded: MESSAGE_BRIDGE_SCRIPT, 
                // Needed on iOS 15+ for camera access; the host app also needs the Info.plist usage keys.
                mediaCapturePermissionGrantType: "grant", style: styles.webview, startInLoadingState: true })) : (react_1.default.createElement(react_native_1.View, { style: styles.webview },
                react_1.default.createElement(react_native_1.Text, { style: styles.fallbackText }, "WebView is not available. Install react-native-webview for native verification."))))));
};
exports.HostedKycWebView = HostedKycWebView;
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
    errorContainer: {
        padding: 16,
        margin: 16,
        backgroundColor: '#fee',
        borderWidth: 1,
        borderColor: '#fcc',
        borderRadius: 8,
    },
    errorText: {
        color: '#c00',
    },
});
