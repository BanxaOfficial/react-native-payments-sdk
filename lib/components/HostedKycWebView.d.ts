import React from 'react';
import { HostedKycEventDetail } from '../types';
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
export declare const HostedKycWebView: React.FC<HostedKycWebViewProps>;
