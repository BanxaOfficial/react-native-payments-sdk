import { CreateKycSessionRequest } from '../types';

/**
 * Builds the POST /kyc/sessions body, leaving out fields the caller did not set.
 *
 * @param {CreateKycSessionRequest} request
 * @return {Record<string, unknown>}
 */
export function serializeCreateKycSessionRequest(
  request: CreateKycSessionRequest
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    externalCustomerId: request.externalCustomerId,
    tier: request.tier,
    country: request.country,
    returnUrl: request.returnUrl,
  };

  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined)
  );
}
