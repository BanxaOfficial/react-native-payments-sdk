import { ApiClient } from '../client/apiClient';
import { CustomerIdentityRequest, CustomerIdentity } from '../types';
export declare class CustomerIdentityModule {
    private client;
    constructor(client: ApiClient);
    /**
     * Register or update customer identity
     * @param request Customer identity data
     * @returns Customer identity record
     */
    registerCustomerIdentity(request: CustomerIdentityRequest): Promise<CustomerIdentity>;
    /**
     * Get customer identity by account reference
     * @param accountReference The account reference
     * @returns Customer identity details
     */
    getCustomerIdentity(accountReference: string): Promise<CustomerIdentity>;
}
