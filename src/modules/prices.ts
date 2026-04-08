import { ApiClient } from '../client/apiClient';
import {
  GetQuoteRequest,
  Quote,
  OrderType,
  BanxaResponse,
} from '../types';
import { unwrapResponse } from '../utils/unwrapApiResponse';

export class PricesModule {
  constructor(private client: ApiClient) {}

  /**
   * Get a quote (GET /quotes/{orderType}).
   * Either fiatAmount or cryptoAmount must be provided.
   * @param orderType 'buy' or 'sell'
   * @param request Quote request (fiat, crypto, paymentMethodId, blockchain, and one of fiatAmount/cryptoAmount)
   */
  async getQuote(orderType: OrderType, request: GetQuoteRequest): Promise<Quote> {
    const params: Record<string, string> = {
      fiat: request.fiat,
      crypto: request.crypto,
      paymentMethodId: request.paymentMethodId,
      blockchain: request.blockchain,
    };
    if (request.fiatAmount != null) params.fiatAmount = request.fiatAmount;
    if (request.cryptoAmount != null) params.cryptoAmount = request.cryptoAmount;
    if (request.externalCustomerId != null)
      params.externalCustomerId = request.externalCustomerId;
    if (request.ipAddress != null) params.ipAddress = request.ipAddress;
    if (request.discountCode != null) params.discountCode = request.discountCode;

    const response = await this.client.get<BanxaResponse<Quote> | Quote>(
      `/quotes/${orderType}`,
      params
    );
    return unwrapResponse(response);
  }

  /**
   * Get buy quote (GET /quotes/buy).
   */
  async getBuyQuote(request: GetQuoteRequest): Promise<Quote> {
    return this.getQuote('buy', request);
  }

  /**
   * Get sell quote (GET /quotes/sell).
   */
  async getSellQuote(request: GetQuoteRequest): Promise<Quote> {
    return this.getQuote('sell', request);
  }
}
