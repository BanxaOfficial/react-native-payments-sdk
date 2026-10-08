import { KycModule } from '../modules/kyc';
import { ApiClient } from '../client/apiClient';
import {
  CreateKycSessionRequest,
  KycSession,
  BanxaResponse,
} from '../types';
import { BanxaSDKError } from '../errors';
import { serializeCreateKycSessionRequest } from '../utils/serializeCreateKycSessionRequest';

jest.mock('../client/apiClient');

describe('serializeCreateKycSessionRequest', () => {
  it('includes all fields when provided', () => {
    const request: CreateKycSessionRequest = {
      externalCustomerId: 'user-123',
      tier: 'enhanced',
      country: 'US',
      returnUrl: 'https://app.com/return',
    };

    expect(serializeCreateKycSessionRequest(request)).toEqual({
      externalCustomerId: 'user-123',
      tier: 'enhanced',
      country: 'US',
      returnUrl: 'https://app.com/return',
    });
  });

  it('omits optional fields that are undefined rather than sending null', () => {
    const request: CreateKycSessionRequest = {
      externalCustomerId: 'user-123',
    };

    const body = serializeCreateKycSessionRequest(request);

    expect(body).toEqual({ externalCustomerId: 'user-123' });
    expect('tier' in body).toBe(false);
    expect('country' in body).toBe(false);
    expect('returnUrl' in body).toBe(false);
  });
});

describe('KycModule', () => {
  let kycModule: KycModule;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({
      apiKey: 'test-key',
      partner: 'test-partner',
    }) as jest.Mocked<ApiClient>;
    kycModule = new KycModule(mockApiClient);
  });

  describe('createSession', () => {
    it('creates a hosted KYC session successfully', async () => {
      const request: CreateKycSessionRequest = {
        externalCustomerId: 'user-123',
        tier: 'standard',
      };

      const mockSession: KycSession = {
        redirectUrl: 'https://space.banxa.com/kyc-transit?token=abc',
        expiresAt: '2026-09-28T12:00:00Z',
      };

      mockApiClient.post = jest.fn().mockResolvedValueOnce(mockSession);

      const result = await kycModule.createSession(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/kyc/sessions', {
        externalCustomerId: 'user-123',
        tier: 'standard',
      });
      expect(result).toEqual(mockSession);
    });

    it('unwraps a { data } envelope when the API returns one', async () => {
      const request: CreateKycSessionRequest = { externalCustomerId: 'user-123' };
      const mockSession: KycSession = {
        redirectUrl: 'https://space.banxa.com/kyc-transit?token=abc',
        expiresAt: '2026-09-28T12:00:00Z',
      };
      const mockResponse: BanxaResponse<KycSession> = { data: mockSession };

      mockApiClient.post = jest.fn().mockResolvedValueOnce(mockResponse);

      const result = await kycModule.createSession(request);

      expect(result).toEqual(mockSession);
    });

    it('does not send undefined optional fields', async () => {
      const request: CreateKycSessionRequest = { externalCustomerId: 'user-123' };
      mockApiClient.post = jest.fn().mockResolvedValueOnce({
        redirectUrl: 'https://space.banxa.com/kyc-transit?token=abc',
        expiresAt: '2026-09-28T12:00:00Z',
      });

      await kycModule.createSession(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/kyc/sessions', {
        externalCustomerId: 'user-123',
      });
    });

    it('propagates the status code from a 403 (merchant not enabled)', async () => {
      const request: CreateKycSessionRequest = { externalCustomerId: 'user-123' };
      mockApiClient.post = jest.fn().mockRejectedValueOnce(
        new BanxaSDKError('Forbidden', 'FORBIDDEN', 403)
      );

      await expect(kycModule.createSession(request)).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  describe('initializeHostedKycWebView', () => {
    it('maps a session to HostedKycWebView props', () => {
      const session: KycSession = {
        redirectUrl: 'https://space.banxa.com/kyc-transit?token=abc',
        expiresAt: '2026-09-28T12:00:00Z',
      };
      const onClose = jest.fn();
      const onComplete = jest.fn();

      const props = kycModule.initializeHostedKycWebView(session, {
        onClose,
        onComplete,
        returnUrl: 'https://app.com/return',
      });

      expect(props.sessionUrl).toBe(session.redirectUrl);
      expect(props.expiresAt).toBe(session.expiresAt);
      expect(props.visible).toBe(true);
      expect(props.onClose).toBe(onClose);
      expect(props.onComplete).toBe(onComplete);
      expect(props.returnUrl).toBe('https://app.com/return');
    });

    it('defaults onClose to a no-op when not provided', () => {
      const session: KycSession = {
        redirectUrl: 'https://space.banxa.com/kyc-transit?token=abc',
        expiresAt: '2026-09-28T12:00:00Z',
      };

      const props = kycModule.initializeHostedKycWebView(session);

      expect(typeof props.onClose).toBe('function');
      expect(() => props.onClose()).not.toThrow();
    });
  });
});
