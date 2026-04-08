import { CurrenciesModule } from '../modules/currencies';
import { ApiClient } from '../client/apiClient';
import { Fiat, Crypto, BanxaResponse } from '../types';

jest.mock('../client/apiClient');

describe('CurrenciesModule', () => {
  let currenciesModule: CurrenciesModule;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({
      apiKey: 'test-key',
      partner: 'test-partner',
    }) as jest.Mocked<ApiClient>;
    currenciesModule = new CurrenciesModule(mockApiClient);
  });

  describe('getFiats', () => {
    it('should get fiats for buy (default)', async () => {
      const mockFiats: Fiat[] = [
        {
          id: 'USD',
          description: 'US Dollar',
          symbol: '$',
          supportedPaymentMethods: [
            { id: 'debit-credit-card', name: 'Credit Debit Card', minimum: '10', maximum: '50000' },
          ],
        },
      ];
      const mockResponse: BanxaResponse<Fiat[]> = { data: mockFiats };
      mockApiClient.get = jest.fn().mockResolvedValueOnce(mockResponse);

      const result = await currenciesModule.getFiats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/fiats/buy');
      expect(result).toEqual(mockFiats);
    });

    it('should get fiats for sell', async () => {
      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: [] });

      await currenciesModule.getFiats('sell');

      expect(mockApiClient.get).toHaveBeenCalledWith('/fiats/sell');
    });
  });

  describe('getCrypto', () => {
    it('should get crypto for buy (default)', async () => {
      const mockCrypto: Crypto[] = [
        {
          id: 'BTC',
          description: 'Bitcoin',
          blockchains: [
            {
              id: 'BTC',
              description: 'Bitcoin',
              isDefaultBlockchain: true,
              address: null,
              network: null,
              minimum: '0.0001',
              unsupportedCountries: {},
            },
          ],
        },
      ];
      const mockResponse: BanxaResponse<Crypto[]> = { data: mockCrypto };
      mockApiClient.get = jest.fn().mockResolvedValueOnce(mockResponse);

      const result = await currenciesModule.getCrypto();

      expect(mockApiClient.get).toHaveBeenCalledWith('/crypto/buy');
      expect(result).toEqual(mockCrypto);
    });

    it('should get crypto for sell', async () => {
      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: [] });

      await currenciesModule.getCrypto('sell');

      expect(mockApiClient.get).toHaveBeenCalledWith('/crypto/sell');
    });
  });

  describe('getFiatCurrencies', () => {
    it('should call getFiats with buy', async () => {
      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: [] });

      await currenciesModule.getFiatCurrencies();

      expect(mockApiClient.get).toHaveBeenCalledWith('/fiats/buy');
    });
  });

  describe('getCryptoCurrencies', () => {
    it('should call getCrypto with buy', async () => {
      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: [] });

      await currenciesModule.getCryptoCurrencies();

      expect(mockApiClient.get).toHaveBeenCalledWith('/crypto/buy');
    });
  });
});
