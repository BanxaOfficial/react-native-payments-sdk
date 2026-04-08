"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapResponse = unwrapResponse;
/**
 * Banxa API returns some payloads at the top level (e.g. { checkoutUrl, id, ... })
 * rather than wrapped in { data: ... }. Unwrap so we always return the payload.
 */
function unwrapResponse(response) {
    if (response != null &&
        typeof response === 'object' &&
        'data' in response &&
        response.data !== undefined) {
        return response.data;
    }
    return response;
}
