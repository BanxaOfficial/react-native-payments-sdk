"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const react_native_1 = require("@primer-io/react-native");
const react_native_2 = require("react-native");
class OrdersModule {
    constructor(client) {
        this.client = client;
    }
    /**
     * Check whether the user is eligible to complete an order with the given params.
     * Uses the same parameters as create order. This endpoint is not yet in Banxa documentation.
     * Use response.paymentReady to choose flow: true → Primer (createOrderAndShowPrimerCheckout),
     * false/absent → WebView (createOrder + initializeCheckoutWebView).
     * @param request Order creation request (same params as createOrder)
     * @returns Eligibility result (eligible, paymentReady, message)
     */
    async checkOrderEligibility(request) {
        const response = await this.client.post('/orders/eligibility', request);
        return response.data;
    }
    /**
     * Create a new order
     * @param request Order creation request
     * @returns Created order
     */
    async createOrder(request) {
        const response = await this.client.post('/orders', request);
        return response.data;
    }
    /**
     * Create a new order and show Primer Universal Checkout using the order's payment_token.
     * Calls the create order endpoint, then initialises the Primer React Native SDK with the
     * payment_token from the response and presents Universal Checkout. Primer options are
     * initialised inside this function before showing checkout.
     *
     * @param request Order creation request
     * @returns The created order
     * @throws Error if the order response does not include payment_token (use createOrder + initializeCheckoutWebView with checkout_url instead)
     */
    async createOrderAndShowPrimerCheckout(request) {
        const order = await this.createOrder(request);
        if (!order.payment_token) {
            throw new Error('Order response does not include payment_token. Use createOrder() and initializeCheckoutWebView() with checkout_url for WebView checkout instead.');
        }
        const primerOptions = {
            // You can customize these settings based on your needs
            paymentHandling: 'AUTO',
            onCheckoutComplete: (_checkoutData) => {
                console.log('Checkout completed successfully!');
                react_native_2.Alert.alert('Success', 'Payment completed successfully!');
            },
            onError: (error, _checkoutData) => {
                console.error('Checkout error:', error);
                react_native_2.Alert.alert('Error', `Payment failed: ${error.description}`);
            },
            onDismiss: () => {
                console.log('Checkout dismissed');
            },
            paymentMethodOptions: {
                applePayOptions: {
                    merchantIdentifier: 'merchant.com.yourdomain',
                    isCaptureBillingAddressEnabled: false,
                    showApplePayForUnsupportedDevice: true,
                },
            },
        };
        await react_native_1.Primer.configure(primerOptions);
        await react_native_1.Primer.showUniversalCheckout(order.payment_token);
        return order;
    }
    /**
     * Get order details by order ID
     * @param orderId The order ID
     * @returns Order details
     */
    async getOrder(orderId) {
        const response = await this.client.get(`/orders/${orderId}`);
        return response.data;
    }
    /**
     * Get orders by account reference
     * @param accountReference The account reference
     * @param perPage Number of results per page (default: 50)
     * @param page Page number (default: 1)
     * @returns List of orders
     */
    async getOrdersByAccount(accountReference, perPage = 50, page = 1) {
        const response = await this.client.get('/orders', {
            account_reference: accountReference,
            per_page: perPage,
            page,
        });
        return response.data;
    }
    /**
     * Get WebView props for initializing a checkout WebView from an order
     * @param order The order object containing checkout_url
     * @param additionalProps Additional props for the WebView component
     * @returns Props object ready to be passed to CheckoutWebView component
     */
    initializeCheckoutWebView(order, additionalProps) {
        if (!order.checkout_url) {
            throw new Error('Order does not have a checkout URL');
        }
        return {
            checkoutUrl: order.checkout_url,
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
exports.OrdersModule = OrdersModule;
