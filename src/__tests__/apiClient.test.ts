import { ApiClient } from '../client/apiClient';
import { BanxaConfig } from '../types';
import { BanxaSDKError } from '../errors';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const mockConfig: BanxaConfig = {
    apiKey: 'test-api-key',
    partner: 'test-partner',
    environment: 'production',
  };

  beforeEach(() => {
    apiClient = new ApiClient(mockConfig);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('constructor', () => {
    it('should initialize with production baseUrl by default', () => {
      const client = new ApiClient(mockConfig);
      expect(client).toBeInstanceOf(ApiClient);
    });

    it('should initialize with sandbox baseUrl when environment is sandbox', () => {
      const sandboxConfig = { ...mockConfig, environment: 'sandbox' as const };
      const client = new ApiClient(sandboxConfig);
      expect(client).toBeInstanceOf(ApiClient);
    });

    it('should use custom baseUrl when provided', () => {
      const customConfig = { ...mockConfig, baseUrl: 'https://custom.api.com/v2' };
      const client = new ApiClient(customConfig);
      expect(client).toBeInstanceOf(ApiClient);
    });
  });

  describe('get', () => {
    it('should make GET request with correct headers', async () => {
      const mockResponse = { data: { id: '123' } };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.banxa.com/test-partner/v2/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should append query parameters to URL', async () => {
      const mockResponse = { data: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await apiClient.get('/test', { page: 1, limit: 10 });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.banxa.com/test-partner/v2/test?page=1&limit=10',
        expect.any(Object)
      );
    });

    it('should filter out undefined query parameters', async () => {
      const mockResponse = { data: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await apiClient.get('/test', { page: 1, limit: undefined });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.banxa.com/test-partner/v2/test?page=1',
        expect.any(Object)
      );
    });
  });

  describe('post', () => {
    it('should make POST request with body', async () => {
      const mockResponse = { data: { id: '123' } };
      const requestBody = { name: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.post('/test', requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.banxa.com/test-partner/v2/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should throw BanxaSDKError on HTTP error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid request', code: 'INVALID_REQUEST' }),
      });

      try {
        await apiClient.get('/test');
        expect(true).toBe(false); // should have thrown
      } catch (e) {
        expect(e).toBeInstanceOf(BanxaSDKError);
        expect((e as Error).message).toBe('Invalid request');
      }
    });

    it('should throw BanxaSDKError with status code', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
      });

      try {
        await apiClient.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(BanxaSDKError);
        expect((error as BanxaSDKError).statusCode).toBe(404);
      }
    });

    it('should throw BanxaSDKError on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await apiClient.get('/test');
        expect(true).toBe(false); // should have thrown
      } catch (e) {
        expect(e).toBeInstanceOf(BanxaSDKError);
        expect((e as Error).message).toBe('Network error');
      }
    });

    it('should handle JSON parse errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      try {
        await apiClient.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(BanxaSDKError);
        expect((error as BanxaSDKError).statusCode).toBe(500);
      }
    });

    it('should pass through API error body as details', async () => {
      const apiBody = { message: 'Validation failed', code: 'VALIDATION_ERROR', errors: ['fiat is required'] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => apiBody,
      });

      try {
        await apiClient.get('/test');
        expect(true).toBe(false);
      } catch (e) {
        const err = e as BanxaSDKError;
        expect(err.message).toBe('Validation failed');
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.statusCode).toBe(422);
        expect(err.details).toEqual(apiBody);
      }
    });

    it('should pass through original error as cause on network failure', async () => {
      const networkError = new Error('fetch failed');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      try {
        await apiClient.get('/test');
        expect(true).toBe(false);
      } catch (e) {
        const err = e as BanxaSDKError;
        expect(err.message).toBe('fetch failed');
        expect(err.code).toBe('NETWORK_ERROR');
        expect(err.cause).toBe(networkError);
      }
    });
  });
});



