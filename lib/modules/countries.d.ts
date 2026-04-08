import { ApiClient } from '../client/apiClient';
import { Country } from '../types';
export declare class CountriesModule {
    private client;
    constructor(client: ApiClient);
    /**
     * Get all supported countries
     * @returns List of countries
     */
    getCountries(): Promise<Country[]>;
    /**
     * Get country by code. Banxa API only provides GET /countries (list);
     * this fetches the list and returns the matching country by id or code.
     * @param countryCode ISO country code (e.g. 'US')
     * @returns Country details, or throws if not found
     */
    getCountry(countryCode: string): Promise<Country>;
}
