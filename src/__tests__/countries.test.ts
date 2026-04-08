import { CountriesModule } from '../modules/countries';
import { ApiClient } from '../client/apiClient';
import { Country, BanxaResponse } from '../types';

jest.mock('../client/apiClient');

describe('CountriesModule', () => {
  let countriesModule: CountriesModule;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({
      apiKey: 'test-key',
      partner: 'test-partner',
    }) as jest.Mocked<ApiClient>;
    countriesModule = new CountriesModule(mockApiClient);
  });

  describe('getCountries', () => {
    it('should get all countries', async () => {
      const mockCountries: Country[] = [
        { code: 'US', name: 'United States', is_supported: true },
        { code: 'GB', name: 'United Kingdom', is_supported: true },
        { code: 'AU', name: 'Australia', is_supported: true },
      ];

      const mockResponse: BanxaResponse<Country[]> = {
        data: mockCountries,
      };

      mockApiClient.get = jest.fn().mockResolvedValueOnce(mockResponse);

      const result = await countriesModule.getCountries();

      expect(mockApiClient.get).toHaveBeenCalledWith('/countries');
      expect(result).toEqual(mockCountries);
      expect(result.length).toBe(3);
    });
  });

  describe('getCountry', () => {
    it('should get country by code from countries list', async () => {
      const countryCode = 'US';
      const mockCountries: Country[] = [
        { code: 'US', name: 'United States', is_supported: true },
        { code: 'GB', name: 'United Kingdom', is_supported: true },
      ];

      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: mockCountries,
      });

      const result = await countriesModule.getCountry(countryCode);

      expect(mockApiClient.get).toHaveBeenCalledWith('/countries');
      expect(result).toEqual({ code: 'US', name: 'United States', is_supported: true });
      expect(result.code).toBe(countryCode);
    });

    it('should support API shape (id, description)', async () => {
      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: [
          { id: 'US', description: 'United States of America', states: [] },
          { id: 'GB', description: 'United Kingdom', states: [] },
        ],
      });

      const result = await countriesModule.getCountry('US');

      expect(result.code).toBe('US');
      expect(result.name).toBe('United States of America');
    });

    it('should throw when country not found', async () => {
      mockApiClient.get = jest.fn().mockResolvedValueOnce({
        data: [{ code: 'GB', name: 'United Kingdom', is_supported: true }],
      });

      await expect(countriesModule.getCountry('XX')).rejects.toThrow('Country not found: XX');
    });
  });
});



