import { BanxaResponse } from '../types';

/**
 * Banxa API returns some payloads at the top level (e.g. { checkoutUrl, id, ... })
 * rather than wrapped in { data: ... }. Unwrap so we always return the payload.
 */
export function unwrapResponse<T>(
  response: BanxaResponse<T> | T
): T {
  if (
    response != null &&
    typeof response === 'object' &&
    'data' in response &&
    (response as BanxaResponse<T>).data !== undefined
  ) {
    return (response as BanxaResponse<T>).data;
  }
  return response as T;
}
