"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricesModule = void 0;
const unwrapApiResponse_1 = require("../utils/unwrapApiResponse");
class PricesModule {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get a quote (GET /quotes/{orderType}).
     * Either fiatAmount or cryptoAmount must be provided.
     * @param orderType 'buy' or 'sell'
     * @param request Quote request (fiat, crypto, paymentMethodId, blockchain, and one of fiatAmount/cryptoAmount)
     */
    async getQuote(orderType, request) {
        const params = {
            fiat: request.fiat,
            crypto: request.crypto,
            paymentMethodId: request.paymentMethodId,
            blockchain: request.blockchain,
        };
        if (request.fiatAmount != null)
            params.fiatAmount = request.fiatAmount;
        if (request.cryptoAmount != null)
            params.cryptoAmount = request.cryptoAmount;
        if (request.externalCustomerId != null)
            params.externalCustomerId = request.externalCustomerId;
        if (request.ipAddress != null)
            params.ipAddress = request.ipAddress;
        if (request.discountCode != null)
            params.discountCode = request.discountCode;
        const response = await this.client.get(`/quotes/${orderType}`, params);
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
    /**
     * Get buy quote (GET /quotes/buy).
     */
    async getBuyQuote(request) {
        return this.getQuote('buy', request);
    }
    /**
     * Get sell quote (GET /quotes/sell).
     */
    async getSellQuote(request) {
        return this.getQuote('sell', request);
    }
}
exports.PricesModule = PricesModule;
