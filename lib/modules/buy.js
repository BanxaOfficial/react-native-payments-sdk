"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyModule = void 0;
const unwrapApiResponse_1 = require("../utils/unwrapApiResponse");
const PrimerCheckoutWrapper_1 = require("../primer/PrimerCheckoutWrapper");
const BASE = '/buy';
class BuyModule {
    constructor(client, options) {
        this.client = client;
        this.primerCheckout = options?.primerCheckout ?? new PrimerCheckoutWrapper_1.PrimerCheckoutWrapper({
            callbacks: {
                onCheckoutComplete: () => console.log('Payment completed successfully!'),
                onError: (error) => console.log('Payment failed:', error.description ?? 'Unknown error'),
                onDismiss: () => console.log('Checkout dismissed'),
            },
        });
    }
    /**
     * Call the eligibility endpoint with the same parameters as create order.
     * Use `paymentReady` to choose flow: `true` → {@link createOrderAndShowPrimerCheckout};
     * false/absent → {@link createOrder} then {@link initializeCheckoutWebView}.
     */
    async checkEligibility(request) {
        const response = await this.client.post('/eligibility', { ...request, orderTypeId: 'buy' });
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
    /**
     * Check eligibility, then create order and choose checkout flow automatically:
     * - If `paymentReady === true` → {@link createOrderAndShowPrimerCheckout} (Primer `Order` or WebView result).
     * - If `paymentReady` is false or absent → {@link createOrder}; use {@link initializeCheckoutWebView} for WebView checkout.
     */
    async createOrderWithEligibilityCheck(request) {
        try {
            const eligibility = await this.checkEligibility(request);
            if (eligibility.paymentReady === true) {
                return this.createOrderAndShowPrimerCheckout(request);
            }
        }
        catch (error) {
            console.error('Error creating order with eligibility check:', error);
            throw error;
        }
        return this.createOrder(request);
    }
    /**
     * Create a new buy order
     */
    async createOrder(request) {
        const response = await this.client.post(BASE, request);
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
    /**
     * Create a buy order and show the Primer checkout flow for the chosen payment method.
     * If the order has `nativeToken`, presents Primer and returns the `Order`.
     * If there is no `nativeToken` but `checkoutUrl` is present, returns {@link PrimerCheckoutWebViewResult}
     * so you can render `<CheckoutWebView {...webViewProps} />`.
     * @param options - `paymentMethod` for Primer (default `card`); `webViewProps` extras when falling back to WebView.
     */
    async createOrderAndShowPrimerCheckout(request, options) {
        const order = await this.createOrder(request);
        if (!order.nativeToken) {
            if (!order.checkoutUrl) {
                throw new Error('Order response has no nativeToken and no checkoutUrl; cannot start Primer or WebView checkout.');
            }
            return {
                order,
                webViewProps: this.initializeCheckoutWebView(order, options?.webViewProps),
            };
        }
        const paymentMethod = options?.paymentMethod ?? 'card';
        return this.primerCheckout.showPrimerCheckout(order.nativeToken, order, paymentMethod, {
            callbacks: options?.callbacks,
            paymentMethodType: options?.paymentMethodType,
        });
    }
    /**
     * Get buy order details by order ID
     */
    async getOrder(orderId) {
        const response = await this.client.get(`${BASE}/${orderId}`);
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
    /**
     * Get buy orders by account reference
     */
    async getOrdersByAccount(externalCustomerId, perPage = 50, page = 1) {
        const response = await this.client.get(BASE, {
            externalCustomerId,
            per_page: perPage,
            page,
        });
        return (0, unwrapApiResponse_1.unwrapResponse)(response);
    }
    /**
     * Get WebView props for initializing a checkout WebView from an order
     */
    initializeCheckoutWebView(order, additionalProps) {
        if (!order.checkoutUrl) {
            throw new Error('Order does not have a checkout URL');
        }
        return {
            checkoutUrl: order.checkoutUrl,
            visible: true,
            returnUrlOnSuccess: additionalProps?.returnUrlOnSuccess,
            returnUrlOnFailure: additionalProps?.returnUrlOnFailure,
            returnUrlOnCancelled: additionalProps?.returnUrlOnCancelled,
            onClose: additionalProps?.onClose || (() => { }),
            onSuccess: additionalProps?.onSuccess,
            onFailure: additionalProps?.onFailure,
            onCancelled: additionalProps?.onCancelled,
            onNavigationStateChange: additionalProps?.onNavigationStateChange,
        };
    }
}
exports.BuyModule = BuyModule;
