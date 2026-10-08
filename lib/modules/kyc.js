"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycModule = void 0;
const unwrapApiResponse_1 = require("../utils/unwrapApiResponse");
const serializeCreateKycSessionRequest_1 = require("../utils/serializeCreateKycSessionRequest");
const BASE = '/kyc/sessions';
class KycModule {
    constructor(client) {
        this.client = client;
    }
    /**
     * Creates a hosted KYC session, so a customer can be verified before any order exists.
     *
     * @param {CreateKycSessionRequest} request
     * @return {Promise<KycSession>}
     */
    async createSession(request) {
        const body = (0, serializeCreateKycSessionRequest_1.serializeCreateKycSessionRequest)(request);
        const response = await this.client.post(BASE, body);
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
    /**
     * Returns the props that mount the hosted verification flow for a created session.
     *
     * @param {KycSession} session
     * @param {Omit<HostedKycWebViewProps, 'sessionUrl' | 'expiresAt' | 'visible'>} [additionalProps]
     * @return {HostedKycWebViewProps}
     */
    initializeHostedKycWebView(session, additionalProps) {
        return {
            sessionUrl: session.redirectUrl,
            expiresAt: session.expiresAt,
            visible: true,
            onClose: additionalProps?.onClose || (() => { }),
            onComplete: additionalProps?.onComplete,
            onError: additionalProps?.onError,
            onReady: additionalProps?.onReady,
            onLoading: additionalProps?.onLoading,
            onMessageRejected: additionalProps?.onMessageRejected,
            returnUrl: additionalProps?.returnUrl,
            onNavigationStateChange: additionalProps?.onNavigationStateChange,
            allowedOrigins: additionalProps?.allowedOrigins,
            iframeTitle: additionalProps?.iframeTitle,
        };
    }
}
exports.KycModule = KycModule;
