import { ApiClient } from '../client/apiClient';
import {
  Country,
  BanxaResponse,
} from '../types';
import { unwrapResponse } from '../utils/unwrapApiResponse';

export class CountriesModule {
  constructor(private client: ApiClient) {}

  /**
   * Get all supported countries
   * @returns List of countries
   */
  async getCountries(): Promise<Country[]> {
    const response = await this.client.get<BanxaResponse<Country[]> | Country[]>(
      '/countries'
    );
    return unwrapResponse(response);
  }

  /**
   * Get country by code. Banxa API only provides GET /countries (list);
   * this fetches the list and returns the matching country by id or code.
   * @param countryCode ISO country code (e.g. 'US')
   * @returns Country details, or throws if not found
   */
  async getCountry(countryCode: string): Promise<Country> {
    const list = await this.getCountries();
    const upper = countryCode.toUpperCase();
    const raw = list.find(
      (c: Country & { id?: string; description?: string }) =>
        (c.id ?? c.code)?.toUpperCase() === upper
    ) as (Country & { id?: string; description?: string }) | undefined;
    if (!raw) {
      throw new Error(`Country not found: ${countryCode}`);
    }
    return {
      code: raw.id ?? raw.code,
      name: raw.description ?? raw.name,
      is_supported: raw.is_supported ?? true,
    };
  }
}



