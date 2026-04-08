import { ApiClient } from '../client/apiClient';
import {
  PaymentMethod,
  BanxaResponse,
} from '../types';
import { unwrapResponse } from '../utils/unwrapApiResponse';

export class PaymentMethodsModule {
  constructor(private client: ApiClient) {}

  /**
   * Get all available payment methods
   * @param source Optional source currency code to filter by
   * @param target Optional target currency code to filter by
   * @returns List of payment methods
   */
  async getPaymentMethods(
    source?: string,
    target?: string
  ): Promise<PaymentMethod[]> {
    const response = await this.client.get<BanxaResponse<PaymentMethod[]> | PaymentMethod[]>(
      '/payment-methods',
      {
        source,
        target,
      }
    );
    return unwrapResponse(response);
  }

  /**
   * Get payment method by ID
   * @param paymentMethodId The payment method ID
   * @returns Payment method details
   */
  async getPaymentMethod(paymentMethodId: number): Promise<PaymentMethod> {
    const response = await this.client.get<BanxaResponse<PaymentMethod> | PaymentMethod>(
      `/payment-methods/${paymentMethodId}`
    );
    return unwrapResponse(response);
  }
}



