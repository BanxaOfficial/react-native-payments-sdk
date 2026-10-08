import { ApiClient } from '../client/apiClient';
import { CreateKycSessionRequest, KycSession } from '../types';
import { HostedKycWebViewProps } from '../components/HostedKycWebView';
export declare class KycModule {
    private client;
    constructor(client: ApiClient);
    /**
     * Creates a hosted KYC session, so a customer can be verified before any order exists.
     *
     * @param {CreateKycSessionRequest} request
     * @return {Promise<KycSession>}
     */
    createSession(request: CreateKycSessionRequest): Promise<KycSession>;
    /**
     * Returns the props that mount the hosted verification flow for a created session.
     *
     * @param {KycSession} session
     * @param {Omit<HostedKycWebViewProps, 'sessionUrl' | 'expiresAt' | 'visible'>} [additionalProps]
     * @return {HostedKycWebViewProps}
     */
    initializeHostedKycWebView(session: KycSession, additionalProps?: Omit<HostedKycWebViewProps, 'sessionUrl' | 'expiresAt' | 'visible'>): HostedKycWebViewProps;
}
