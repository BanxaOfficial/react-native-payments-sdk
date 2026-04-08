import { ApiClient } from '../client/apiClient';
import { CreateOrderRequest, Order, OrderEligibilityResponse } from '../types';
import { CheckoutWebViewProps } from '../components/CheckoutWebView';
export declare class OrdersModule {
    private client;
    constructor(client: ApiClient);
    /**
     * Check whether the user is eligible to complete an order with the given params.
     * Uses the same parameters as create order. This endpoint is not yet in Banxa documentation.
     * Use response.paymentReady to choose flow: true → Primer (createOrderAndShowPrimerCheckout),
     * false/absent → WebView (createOrder + initializeCheckoutWebView).
     * @param request Order creation request (same params as createOrder)
     * @returns Eligibility result (eligible, paymentReady, message)
     */
    checkOrderEligibility(request: CreateOrderRequest): Promise<OrderEligibilityResponse>;
    /**
     * Create a new order
     * @param request Order creation request
     * @returns Created order
     */
    createOrder(request: CreateOrderRequest): Promise<Order>;
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
    createOrderAndShowPrimerCheckout(request: CreateOrderRequest): Promise<Order>;
    /**
     * Get order details by order ID
     * @param orderId The order ID
     * @returns Order details
     */
    getOrder(orderId: string): Promise<Order>;
    /**
     * Get orders by account reference
     * @param accountReference The account reference
     * @param perPage Number of results per page (default: 50)
     * @param page Page number (default: 1)
     * @returns List of orders
     */
    getOrdersByAccount(accountReference: string, perPage?: number, page?: number): Promise<Order[]>;
    /**
     * Get WebView props for initializing a checkout WebView from an order
     * @param order The order object containing checkout_url
     * @param additionalProps Additional props for the WebView component
     * @returns Props object ready to be passed to CheckoutWebView component
     */
    initializeCheckoutWebView(order: Order, additionalProps?: Omit<CheckoutWebViewProps, 'checkoutUrl' | 'visible'>): CheckoutWebViewProps;
}
