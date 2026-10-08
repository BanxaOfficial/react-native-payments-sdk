"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCreateKycSessionRequest = serializeCreateKycSessionRequest;
/**
 * Builds the POST /kyc/sessions body, leaving out fields the caller did not set.
 *
 * @param {CreateKycSessionRequest} request
 * @return {Record<string, unknown>}
 */
function serializeCreateKycSessionRequest(request) {
    const body = {
        externalCustomerId: request.externalCustomerId,
        tier: request.tier,
        country: request.country,
        returnUrl: request.returnUrl,
    };
    return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined));
}
