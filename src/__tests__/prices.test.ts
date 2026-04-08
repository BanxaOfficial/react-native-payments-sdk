import { PricesModule } from '../modules/prices';
import { ApiClient } from '../client/apiClient';
import { GetQuoteRequest, Quote, BanxaResponse } from '../types';

jest.mock('../client/apiClient');

describe('PricesModule', () => {
  let pricesModule: PricesModule;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({
      apiKey: 'test-key',
      partner: 'test-partner',
    }) as jest.Mocked<ApiClient>;
    pricesModule = new PricesModule(mockApiClient);
  });

  describe('getQuote', () => {
    it('should get buy quote', async () => {
      const request: GetQuoteRequest = {
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        paymentMethodId: 'debit-credit-card',
        blockchain: 'BTC',
      };
      const mockQuote: Quote = {
        paymentMethodId: 'debit-credit-card',
        cryptoAmount: '0.03564700',
        fiatAmount: '100.00',
        processingFee: '0.92',
        networkFee: '1.67',
      };
      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: mockQuote });

      const result = await pricesModule.getQuote('buy', request);

      expect(mockApiClient.get).toHaveBeenCalledWith('/quotes/buy', {
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        paymentMethodId: 'debit-credit-card',
        blockchain: 'BTC',
      });
      expect(result).toEqual(mockQuote);
      expect(result.fiatAmount).toBe('100.00');
    });

    it('should get sell quote with cryptoAmount', async () => {
      const request: GetQuoteRequest = {
        fiat: 'USD',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        paymentMethodId: 'debit-credit-card',
        blockchain: 'BTC',
      };
      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: {
          paymentMethodId: 'debit-credit-card',
          cryptoAmount: '0.001',
          fiatAmount: '50.00',
          processingFee: '0.50',
          networkFee: '0.00',
        },
      });

      await pricesModule.getQuote('sell', request);

      expect(mockApiClient.get).toHaveBeenCalledWith('/quotes/sell', {
        fiat: 'USD',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        paymentMethodId: 'debit-credit-card',
        blockchain: 'BTC',
      });
    });

    it('should pass optional params when provided', async () => {
      const request: GetQuoteRequest = {
        fiat: 'USD',
        crypto: 'ETH',
        fiatAmount: '200',
        paymentMethodId: 'apple-pay',
        blockchain: 'ETH',
        externalCustomerId: 'cust-1',
        discountCode: 'XMAS',
      };
      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: {} as Quote });

      await pricesModule.getQuote('buy', request);

      expect(mockApiClient.get).toHaveBeenCalledWith('/quotes/buy', {
        fiat: 'USD',
        crypto: 'ETH',
        fiatAmount: '200',
        paymentMethodId: 'apple-pay',
        blockchain: 'ETH',
        externalCustomerId: 'cust-1',
        discountCode: 'XMAS',
      });
    });
  });

  describe('getBuyQuote', () => {
    it('should call getQuote with buy', async () => {
      const request: GetQuoteRequest = {
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        paymentMethodId: 'debit-credit-card',
        blockchain: 'BTC',
      };
      const mockQuote: Quote = {
        paymentMethodId: 'debit-credit-card',
        cryptoAmount: '0.002',
        fiatAmount: '100.00',
        processingFee: '0.92',
        networkFee: '1.67',
      };
      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: mockQuote });

      const result = await pricesModule.getBuyQuote(request);

      expect(mockApiClient.get).toHaveBeenCalledWith('/quotes/buy', expect.any(Object));
      expect(result).toEqual(mockQuote);
    });
  });

  describe('getSellQuote', () => {
    it('should call getQuote with sell', async () => {
      const request: GetQuoteRequest = {
        fiat: 'USD',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        paymentMethodId: 'debit-credit-card',
        blockchain: 'BTC',
      };
      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: {} as Quote });

      await pricesModule.getSellQuote(request);

      expect(mockApiClient.get).toHaveBeenCalledWith('/quotes/sell', expect.any(Object));
    });
  });
});
