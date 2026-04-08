import { ApiClient } from '../client/apiClient';
import { PaymentMethod } from '../types';
export declare class PaymentMethodsModule {
    private client;
    constructor(client: ApiClient);
    /**
     * Get all available payment methods
     * @param source Optional source currency code to filter by
     * @param target Optional target currency code to filter by
     * @returns List of payment methods
     */
    getPaymentMethods(source?: string, target?: string): Promise<PaymentMethod[]>;
    /**
     * Get payment method by ID
     * @param paymentMethodId The payment method ID
     * @returns Payment method details
     */
    getPaymentMethod(paymentMethodId: number): Promise<PaymentMethod>;
}
