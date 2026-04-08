"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerIdentityModule = void 0;
class CustomerIdentityModule {
    constructor(client) {
        this.client = client;
    }
    /**
     * Register or update customer identity
     * @param request Customer identity data
     * @returns Customer identity record
     */
    async registerCustomerIdentity(request) {
        const response = await this.client.post('/customer-identity', request);
        return response.data;
    }
    /**
     * Get customer identity by account reference
     * @param accountReference The account reference
     * @returns Customer identity details
     */
    async getCustomerIdentity(accountReference) {
        const response = await this.client.get(`/customer-identity/${accountReference}`);
        return response.data;
    }
}
exports.CustomerIdentityModule = CustomerIdentityModule;
