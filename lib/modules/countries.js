"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountriesModule = void 0;
const unwrapApiResponse_1 = require("../utils/unwrapApiResponse");
class CountriesModule {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get all supported countries
     * @returns List of countries
     */
    async getCountries() {
        const response = await this.client.get('/countries');
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
    /**
     * Get country by code. Banxa API only provides GET /countries (list);
     * this fetches the list and returns the matching country by id or code.
     * @param countryCode ISO country code (e.g. 'US')
     * @returns Country details, or throws if not found
     */
    async getCountry(countryCode) {
        const list = await this.getCountries();
        const upper = countryCode.toUpperCase();
        const raw = list.find((c) => (c.id ?? c.code)?.toUpperCase() === upper);
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
exports.CountriesModule = CountriesModule;
