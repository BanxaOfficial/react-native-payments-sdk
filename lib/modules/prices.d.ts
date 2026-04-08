import { ApiClient } from '../client/apiClient';
import { GetQuoteRequest, Quote, OrderType } from '../types';
export declare class PricesModule {
    private client;
    constructor(client: ApiClient);
    /**
     * Get a quote (GET /quotes/{orderType}).
     * Either fiatAmount or cryptoAmount must be provided.
     * @param orderType 'buy' or 'sell'
     * @param request Quote request (fiat, crypto, paymentMethodId, blockchain, and one of fiatAmount/cryptoAmount)
     */
    getQuote(orderType: OrderType, request: GetQuoteRequest): Promise<Quote>;
    /**
     * Get buy quote (GET /quotes/buy).
     */
    getBuyQuote(request: GetQuoteRequest): Promise<Quote>;
    /**
     * Get sell quote (GET /quotes/sell).
     */
    getSellQuote(request: GetQuoteRequest): Promise<Quote>;
}
