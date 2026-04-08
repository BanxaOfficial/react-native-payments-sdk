import React from 'react';
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
export declare const CheckoutWebView: React.FC<CheckoutWebViewProps>;
