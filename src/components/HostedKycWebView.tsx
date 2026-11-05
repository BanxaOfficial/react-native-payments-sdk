import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { HostedKycEventDetail } from '../types';

// react-native-webview isn't available on web (React Native Web or Expo web).
let WebViewComponent: React.ComponentType<any> | undefined;
try {
  // @ts-ignore - react-native-webview types may not be available
  const webview = require('react-native-webview');
  WebViewComponent = webview?.WebView ?? webview?.default;
} catch {
  WebViewComponent = undefined;
}

const isWeb = Platform.OS === 'web';

/** The message `type` values the hosted KYC flow posts to the page. */
const BANXA_KYC_MESSAGE_TYPES = {
  LOADING: 'banxa:loading',
  READY: 'banxa:ready',
  COMPLETE: 'banxa:kyc-complete',
  ERROR: 'banxa:error',
} as const;

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

interface BanxaFrameMessage {
  type?: string;
  status?: string;
  code?: string | number;
  message?: string;
  origin?: string;
}

export interface HostedKycWebViewProps {
  /** The `redirectUrl` of the created KYC session. */
  sessionUrl: string;
  /** The `expiresAt` of the created KYC session (ISO-8601). */
  expiresAt?: string;
  visible: boolean;
  onClose: () => void;
  /** Fires once when the customer finishes the flow. */
  onComplete?: (detail: HostedKycEventDetail) => void;
  onError?: (detail: HostedKycEventDetail) => void;
  onReady?: () => void;
  onLoading?: () => void;
  /** Fires when a `banxa:*` message from an unknown origin is ignored. */
  onMessageRejected?: (reason: 'origin') => void;
  /** The `returnUrl` the session was created with. */
  returnUrl?: string;
  onNavigationStateChange?: (navState: any) => void;
  /** Extra origins to accept messages from. */
  allowedOrigins?: string[];
  iframeTitle?: string;
}

/**
 * Renders the hosted KYC flow in a modal: a WebView on iOS and Android, an iframe on web.
 *
 * @param {HostedKycWebViewProps} props
 * @return {JSX.Element | null}
 */
export const HostedKycWebView: React.FC<HostedKycWebViewProps> = (props: HostedKycWebViewProps) => {
  const {
    sessionUrl,
    expiresAt,
    visible,
    onClose,
    onComplete,
    onError,
    onReady,
    onLoading,
    onMessageRejected,
    returnUrl,
    onNavigationStateChange,
    allowedOrigins,
    iframeTitle,
  } = props;

  const completedRef = React.useRef(false);

  const acceptedOrigins = React.useMemo(() => {
    const extra = allowedOrigins ?? [];
    try {
      return [new URL(sessionUrl).origin, ...extra];
    } catch {
      return extra;
    }
  }, [sessionUrl, allowedOrigins]);

  const completeOnce = React.useCallback(
    (detail: HostedKycEventDetail) => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete?.(detail);
    },
    [onComplete]
  );

  const handleWebViewMessage = React.useCallback(
    (event: { nativeEvent: { data: string } }) => {
      let data: BanxaFrameMessage | null = null;
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }
      if (!data || typeof data.type !== 'string') return;

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
    },
    [acceptedOrigins, completeOnce, onError, onReady, onLoading, onMessageRejected]
  );

  const checkReturnUrl = React.useCallback(
    (url: string) => {
      if (returnUrl && url.includes(returnUrl)) {
        completeOnce({ status: 'complete' });
        return true;
      }
      return false;
    },
    [returnUrl, completeOnce]
  );

  const handleNavigationStateChange = React.useCallback(
    (navState: any) => {
      const { url } = navState;
      checkReturnUrl(url);
      onNavigationStateChange?.(navState);
    },
    [checkReturnUrl, onNavigationStateChange]
  );

  // Web: the iframe posts to this page, so listen on window directly.
  React.useEffect(() => {
    if (!isWeb) return undefined;
    const win: any = (globalThis as any).window;
    if (!win) return undefined;

    const listener = (event: any) => {
      const data = event.data as BanxaFrameMessage | null;
      if (!data || typeof data !== 'object' || typeof data.type !== 'string') return;
      if (!data.type.startsWith('banxa:')) return;
      if (!acceptedOrigins.includes(event.origin)) {
        onMessageRejected?.('origin');
        return;
      }

      if (data.type === BANXA_KYC_MESSAGE_TYPES.COMPLETE) {
        completeOnce({ status: data.status ?? 'complete' });
      } else if (data.type === BANXA_KYC_MESSAGE_TYPES.ERROR) {
        onError?.({ code: data.code, message: data.message ?? '' });
      } else if (data.type === BANXA_KYC_MESSAGE_TYPES.READY) {
        onReady?.();
      } else if (data.type === BANXA_KYC_MESSAGE_TYPES.LOADING) {
        onLoading?.();
      }
    };

    win.addEventListener('message', listener);
    return () => win.removeEventListener('message', listener);
  }, [acceptedOrigins, completeOnce, onError, onReady, onLoading, onMessageRejected]);

  React.useEffect(() => {
    completedRef.current = false;
  }, [sessionUrl]);

  const hasExpired = React.useCallback(() => {
    if (!expiresAt) return false;
    const timestamp = Date.parse(expiresAt);
    if (Number.isNaN(timestamp)) return false;
    return timestamp <= Date.now();
  }, [expiresAt]);

  const useIframe = isWeb;
  const WebViewOrFallback = WebViewComponent;

  let errorMessage: string | null = null;
  if (!sessionUrl) {
    errorMessage = 'Session URL is required';
  } else if (hasExpired()) {
    errorMessage = 'This verification session has expired. Request a new one to continue.';
  }
  const expiredMessage = errorMessage === 'This verification session has expired. Request a new one to continue.'
    ? errorMessage
    : null;

  React.useEffect(() => {
    if (expiredMessage) {
      onError?.({ code: 'session_expired', message: expiredMessage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiredMessage]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : useIframe ? (
          <iframe
            title={iframeTitle ?? 'Banxa verification'}
            src={sessionUrl}
            allow="camera; microphone"
            style={{ flex: 1, width: '100%', height: '100%', border: 0 }}
          />
        ) : WebViewOrFallback ? (
          <WebViewOrFallback
            source={{ uri: sessionUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleWebViewMessage}
            injectedJavaScriptBeforeContentLoaded={MESSAGE_BRIDGE_SCRIPT}
            // Needed on iOS 15+ for camera access; the host app also needs the Info.plist usage keys.
            mediaCapturePermissionGrantType="grant"
            style={styles.webview}
            startInLoadingState={true}
          />
        ) : (
          <View style={styles.webview}>
            <Text style={styles.fallbackText}>
              WebView is not available. Install react-native-webview for native verification.
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
