import { CustomerIdentityModule } from '../modules/customerIdentity';
import { ApiClient } from '../client/apiClient';
import {
  CustomerIdentityRequest,
  CustomerIdentity,
  BanxaResponse,
} from '../types';

jest.mock('../client/apiClient');

describe('CustomerIdentityModule', () => {
  let customerIdentityModule: CustomerIdentityModule;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({
      apiKey: 'test-key',
      partner: 'test-partner',
    }) as jest.Mocked<ApiClient>;
    customerIdentityModule = new CustomerIdentityModule(mockApiClient);
  });

  describe('registerCustomerIdentity', () => {
    it('should register customer identity successfully', async () => {
      const request: CustomerIdentityRequest = {
        account_reference: 'user-123',
        email: 'user@example.com',
        mobile: '+1234567890',
        given_name: 'John',
        surname: 'Doe',
        date_of_birth: '1990-01-01',
        address: {
          address_line_1: '123 Main St',
          city: 'New York',
          state: 'NY',
          post_code: '10001',
          country_code: 'US',
        },
        kyc_level: 1,
      };

      const mockIdentity: CustomerIdentity = {
        account_reference: 'user-123',
        identity_status: 'pending',
        kyc_level: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockResponse: BanxaResponse<CustomerIdentity> = {
        data: mockIdentity,
      };

      mockApiClient.post = jest.fn().mockResolvedValueOnce(mockResponse);

      const result = await customerIdentityModule.registerCustomerIdentity(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/customer-identity', request);
      expect(result).toEqual(mockIdentity);
      expect(result.account_reference).toBe('user-123');
      expect(result.identity_status).toBe('pending');
    });

    it('should handle minimal request', async () => {
      const request: CustomerIdentityRequest = {
        account_reference: 'user-123',
        email: 'user@example.com',
      };

      const mockIdentity: CustomerIdentity = {
        account_reference: 'user-123',
        identity_status: 'pending',
        kyc_level: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockResponse: BanxaResponse<CustomerIdentity> = {
        data: mockIdentity,
      };

      mockApiClient.post = jest.fn().mockResolvedValueOnce(mockResponse);

      const result = await customerIdentityModule.registerCustomerIdentity(request);

      expect(result).toEqual(mockIdentity);
    });
  });

  describe('getCustomerIdentity', () => {
    it('should get customer identity by account reference', async () => {
      const accountReference = 'user-123';
      const mockIdentity: CustomerIdentity = {
        account_reference: accountReference,
        identity_status: 'approved',
        kyc_level: 2,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockResponse: BanxaResponse<CustomerIdentity> = {
        data: mockIdentity,
      };

      mockApiClient.get = jest.fn().mockResolvedValueOnce(mockResponse);

      const result = await customerIdentityModule.getCustomerIdentity(accountReference);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/customer-identity/${accountReference}`
      );
      expect(result).toEqual(mockIdentity);
      expect(result.account_reference).toBe(accountReference);
      expect(result.identity_status).toBe('approved');
    });
  });
});



