import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';

// react-native-webview may be undefined on web (e.g. RNW or Expo web)
let WebViewComponent: React.ComponentType<any> | undefined;
try {
  // @ts-ignore - react-native-webview types may not be available
  const webview = require('react-native-webview');
  WebViewComponent = webview?.WebView ?? webview?.default;
} catch {
  WebViewComponent = undefined;
}

const isWeb = Platform.OS === 'web';

export interface CheckoutWebViewProps {
  checkoutUrl: string;
  visible: boolean;
  onClose: () => void;
  onNavigationStateChange?: (navState: any) => void;
  onSuccess?: (url: string) => void;
  onFailure?: (url: string) => void;
  onCancelled?: (url: string) => void;
  returnUrlOnSuccess?: string;
  returnUrlOnFailure?: string;
  returnUrlOnCancelled?: string;
}

export const CheckoutWebView: React.FC<CheckoutWebViewProps> = (props: CheckoutWebViewProps) => {
  const {
    checkoutUrl,
    visible,
    onClose,
    onNavigationStateChange,
    onSuccess,
    onFailure,
    onCancelled,
    returnUrlOnSuccess,
    returnUrlOnFailure,
    returnUrlOnCancelled,
  } = props;

  const checkUrl = React.useCallback(
    (url: string) => {
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
    },
    [
      returnUrlOnSuccess,
      returnUrlOnFailure,
      returnUrlOnCancelled,
      onSuccess,
      onFailure,
      onCancelled,
      onClose,
    ]
  );

  const handleNavigationStateChange = React.useCallback(
    (navState: any) => {
      const { url } = navState;
      if (checkUrl(url)) return;
      onNavigationStateChange?.(navState);
    },
    [checkUrl, onNavigationStateChange]
  );

  // On web, react-native-webview often isn't available or is undefined; use an iframe instead.
  const useIframe = isWeb;
  const WebViewOrFallback = WebViewComponent;

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
        {useIframe ? (
          <iframe
            title="Checkout"
            src={checkoutUrl}
            style={{ flex: 1, width: '100%', height: '100%', border: 0 }}
            // On web, iframe won't notify on redirect; return URL detection is limited. Prefer native for full flow.
          />
        ) : WebViewOrFallback ? (
          <WebViewOrFallback
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            style={styles.webview}
            startInLoadingState={true}
          />
        ) : (
          <View style={styles.webview}>
            <Text style={styles.fallbackText}>
              WebView is not available. Install react-native-webview for native checkout.
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
});

