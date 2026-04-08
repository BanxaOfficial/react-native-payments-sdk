"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodsModule = void 0;
const unwrapApiResponse_1 = require("../utils/unwrapApiResponse");
class PaymentMethodsModule {
    constructor(client) {
        this.client = client;
    }
    /**
     * Get all available payment methods
     * @param source Optional source currency code to filter by
     * @param target Optional target currency code to filter by
     * @returns List of payment methods
     */
    async getPaymentMethods(source, target) {
        const response = await this.client.get('/payment-methods', {
            source,
            target,
        });
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
    /**
     * Get payment method by ID
     * @param paymentMethodId The payment method ID
     * @returns Payment method details
     */
    async getPaymentMethod(paymentMethodId) {
        const response = await this.client.get(`/payment-methods/${paymentMethodId}`);
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
}
exports.PaymentMethodsModule = PaymentMethodsModule;
