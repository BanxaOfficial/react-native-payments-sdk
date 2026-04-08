import { ApiClient } from '../client/apiClient';
import {
  CustomerIdentityRequest,
  CustomerIdentity,
  BanxaResponse,
} from '../types';

export class CustomerIdentityModule {
  constructor(private client: ApiClient) {}

  /**
   * Register or update customer identity
   * @param request Customer identity data
   * @returns Customer identity record
   */
  async registerCustomerIdentity(
    request: CustomerIdentityRequest
  ): Promise<CustomerIdentity> {
    const response = await this.client.post<BanxaResponse<CustomerIdentity>>(
      '/customer-identity',
      request
    );
    return response.data;
  }

  /**
   * Get customer identity by account reference
   * @param accountReference The account reference
   * @returns Customer identity details
   */
  async getCustomerIdentity(
    accountReference: string
  ): Promise<CustomerIdentity> {
    const response = await this.client.get<BanxaResponse<CustomerIdentity>>(
      `/customer-identity/${accountReference}`
    );
    return response.data;
  }
}



