import { CreateOrderRequest, CreateBuyOrderApiBody, CreateOrderApiBody } from '../types';
/**
 * Banxa API expects camelCase and specific field names.
 * Buy: source = fiat, target = crypto → fiatAmount = source_amount, cryptoAmount = target_amount
 */
export declare function mapCreateOrderRequestToBuyBody(req: CreateOrderRequest): CreateBuyOrderApiBody;
/**
 * Sell: source = crypto, target = fiat → cryptoAmount = source_amount, fiatAmount = target_amount
 */
export declare function mapCreateOrderRequestToSellBody(req: CreateOrderRequest): CreateOrderApiBody;
