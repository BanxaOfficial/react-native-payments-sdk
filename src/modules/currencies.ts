import { ApiClient } from '../client/apiClient';
import { Fiat, Crypto, OrderType, BanxaResponse } from '../types';
import { unwrapResponse } from '../utils/unwrapApiResponse';

export class CurrenciesModule {
  constructor(private client: ApiClient) {}

  /**
   * Get all available fiat currencies (GET /fiats/{orderType}).
   * @param orderType 'buy' or 'sell' — determines availability. Default 'buy'.
   */
  async getFiats(orderType: OrderType = 'buy'): Promise<Fiat[]> {
    const response = await this.client.get<BanxaResponse<Fiat[]> | Fiat[]>(
      `/fiats/${orderType}`
    );
    return unwrapResponse(response);
  }

  /**
   * Get all available cryptocurrencies (GET /crypto/{orderType}).
   * @param orderType 'buy' or 'sell' — determines availability. Default 'buy'.
   */
  async getCrypto(orderType: OrderType = 'buy'): Promise<Crypto[]> {
    const response = await this.client.get<BanxaResponse<Crypto[]> | Crypto[]>(
      `/crypto/${orderType}`
    );
    return unwrapResponse(response);
  }

  /**
   * Get all fiat currencies for buy orders (convenience for getFiats('buy')).
   */
  async getFiatCurrencies(): Promise<Fiat[]> {
    return this.getFiats('buy');
  }

  /**
   * Get all crypto currencies for buy orders (convenience for getCrypto('buy')).
   */
  async getCryptoCurrencies(): Promise<Crypto[]> {
    return this.getCrypto('buy');
  }
}
