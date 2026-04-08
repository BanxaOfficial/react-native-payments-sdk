import { BanxaResponse } from '../types';
/**
 * Banxa API returns some payloads at the top level (e.g. { checkoutUrl, id, ... })
 * rather than wrapped in { data: ... }. Unwrap so we always return the payload.
 */
export declare function unwrapResponse<T>(response: BanxaResponse<T> | T): T;
