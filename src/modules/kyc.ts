import { ApiClient } from '../client/apiClient';
import {
  CreateKycSessionRequest,
  KycSession,
  BanxaResponse,
} from '../types';
import { unwrapResponse } from '../utils/unwrapApiResponse';
import { serializeCreateKycSessionRequest } from '../utils/serializeCreateKycSessionRequest';
import { HostedKycWebViewProps } from '../components/HostedKycWebView';

const BASE = '/kyc/sessions';

export class KycModule {
  constructor(private client: ApiClient) {}

  /**
   * Creates a hosted KYC session, so a customer can be verified before any order exists.
   *
   * @param {CreateKycSessionRequest} request
   * @return {Promise<KycSession>}
   */
  async createSession(request: CreateKycSessionRequest): Promise<KycSession> {
    const body = serializeCreateKycSessionRequest(request);
    const response = await this.client.post<BanxaResponse<KycSession> | KycSession>(
      BASE,
      body
    );
    return unwrapResponse(response);
  }

  /**
   * Returns the props that mount the hosted verification flow for a created session.
   *
   * @param {KycSession} session
   * @param {Omit<HostedKycWebViewProps, 'sessionUrl' | 'expiresAt' | 'visible'>} [additionalProps]
   * @return {HostedKycWebViewProps}
   */
  initializeHostedKycWebView(
    session: KycSession,
    additionalProps?: Omit<HostedKycWebViewProps, 'sessionUrl' | 'expiresAt' | 'visible'>
  ): HostedKycWebViewProps {
    return {
      sessionUrl: session.redirectUrl,
      expiresAt: session.expiresAt,
      visible: true,
      onClose: additionalProps?.onClose || (() => {}),
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
