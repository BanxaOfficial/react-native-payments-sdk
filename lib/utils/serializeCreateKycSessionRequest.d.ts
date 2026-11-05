import { CreateKycSessionRequest } from '../types';
/**
 * Builds the POST /kyc/sessions body, leaving out fields the caller did not set.
 *
 * @param {CreateKycSessionRequest} request
 * @return {Record<string, unknown>}
 */
export declare function serializeCreateKycSessionRequest(request: CreateKycSessionRequest): Record<string, unknown>;
