import { PaymentMethodsModule } from '../modules/paymentMethods';
import { ApiClient } from '../client/apiClient';
import { PaymentMethod, BanxaResponse } from '../types';

jest.mock('../client/apiClient');

describe('PaymentMethodsModule', () => {
  let paymentMethodsModule: PaymentMethodsModule;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({
      apiKey: 'test-key',
      partner: 'test-partner',
    }) as jest.Mocked<ApiClient>;
    paymentMethodsModule = new PaymentMethodsModule(mockApiClient);
  });

  describe('getPaymentMethods', () => {
    it('should get all payment methods', async () => {
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 1,
          type: 'card',
          name: 'Credit Card',
          logo: 'https://example.com/logo.png',
          status: 'active',
          supported_currencies: ['USD', 'EUR'],
          supported_countries: ['US', 'GB'],
        },
        {
          id: 2,
          type: 'bank_transfer',
          name: 'Bank Transfer',
          logo: 'https://example.com/bank.png',
          status: 'active',
          supported_currencies: ['USD'],
          supported_countries: ['US'],
        },
      ];

      const mockResponse: BanxaResponse<PaymentMethod[]> = {
        data: mockPaymentMethods,
      };

      mockApiClient.get = jest.fn().mockResolvedValueOnce(mockResponse);

      const result = await paymentMethodsModule.getPaymentMethods();

      expect(mockApiClient.get).toHaveBeenCalledWith('/payment-methods', {
        source: undefined,
        target: undefined,
      });
      expect(result).toEqual(mockPaymentMethods);
      expect(result.length).toBe(2);
    });

    it('should filter payment methods by source and target', async () => {
      const mockResponse: BanxaResponse<PaymentMethod[]> = {
        data: [],
      };

      mockApiClient.get = jest.fn().mockResolvedValueOnce(mockResponse);

      await paymentMethodsModule.getPaymentMethods('USD', 'BTC');

      expect(mockApiClient.get).toHaveBeenCalledWith('/payment-methods', {
        source: 'USD',
        target: 'BTC',
      });
    });
  });

  describe('getPaymentMethod', () => {
    it('should get payment method by ID', async () => {
      const paymentMethodId = 1;
      const mockPaymentMethod: PaymentMethod = {
        id: paymentMethodId,
        type: 'card',
        name: 'Credit Card',
        logo: 'https://example.com/logo.png',
        status: 'active',
        supported_currencies: ['USD', 'EUR'],
        supported_countries: ['US', 'GB'],
      };

      const mockResponse: BanxaResponse<PaymentMethod> = {
        data: mockPaymentMethod,
      };

      mockApiClient.get = jest.fn().mockResolvedValueOnce(mockResponse);

      const result = await paymentMethodsModule.getPaymentMethod(paymentMethodId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/payment-methods/${paymentMethodId}`);
      expect(result).toEqual(mockPaymentMethod);
      expect(result.id).toBe(paymentMethodId);
    });
  });
});



