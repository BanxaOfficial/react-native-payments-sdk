import { ApiClient } from '../client/apiClient';
import { Fiat, Crypto, OrderType } from '../types';
export declare class CurrenciesModule {
    private client;
    constructor(client: ApiClient);
    /**
     * Get all available fiat currencies (GET /fiats/{orderType}).
     * @param orderType 'buy' or 'sell' — determines availability. Default 'buy'.
     */
    getFiats(orderType?: OrderType): Promise<Fiat[]>;
    /**
     * Get all available cryptocurrencies (GET /crypto/{orderType}).
     * @param orderType 'buy' or 'sell' — determines availability. Default 'buy'.
     */
    getCrypto(orderType?: OrderType): Promise<Crypto[]>;
    /**
     * Get all fiat currencies for buy orders (convenience for getFiats('buy')).
     */
    getFiatCurrencies(): Promise<Fiat[]>;
    /**
     * Get all crypto currencies for buy orders (convenience for getCrypto('buy')).
     */
    getCryptoCurrencies(): Promise<Crypto[]>;
}
