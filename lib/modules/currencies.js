"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrenciesModule = void 0;
const unwrapApiResponse_1 = require("../utils/unwrapApiResponse");
class CurrenciesModule {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get all available fiat currencies (GET /fiats/{orderType}).
     * @param orderType 'buy' or 'sell' — determines availability. Default 'buy'.
     */
    async getFiats(orderType = 'buy') {
        const response = await this.client.get(`/fiats/${orderType}`);
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
    /**
     * Get all available cryptocurrencies (GET /crypto/{orderType}).
     * @param orderType 'buy' or 'sell' — determines availability. Default 'buy'.
     */
    async getCrypto(orderType = 'buy') {
        const response = await this.client.get(`/crypto/${orderType}`);
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
    /**
     * Get all fiat currencies for buy orders (convenience for getFiats('buy')).
     */
    async getFiatCurrencies() {
        return this.getFiats('buy');
    }
    /**
     * Get all crypto currencies for buy orders (convenience for getCrypto('buy')).
     */
    async getCryptoCurrencies() {
        return this.getCrypto('buy');
    }
}
exports.CurrenciesModule = CurrenciesModule;
