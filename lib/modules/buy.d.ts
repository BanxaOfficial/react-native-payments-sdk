import { ApiClient } from '../client/apiClient';
import { CreateBuyOrderRequest, Order, OrderEligibilityResponse, PrimerCheckoutFlowOptions, CreateOrderAndShowPrimerCheckoutResult, PrimerCheckoutWebViewResult } from '../types';
import { CheckoutWebViewProps } from '../components/CheckoutWebView';
import { PrimerCheckoutWrapper } from '../primer/PrimerCheckoutWrapper';
export declare class BuyModule {
    private client;
    private primerCheckout;
    constructor(client: ApiClient, options?: {
        primerCheckout?: PrimerCheckoutWrapper;
    });
    /**
     * Call the eligibility endpoint with the same parameters as create order.
     * Use `paymentReady` to choose flow: `true` → {@link createOrderAndShowPrimerCheckout};
     * false/absent → {@link createOrder} then {@link initializeCheckoutWebView}.
     */
    checkEligibility(request: CreateBuyOrderRequest): Promise<OrderEligibilityResponse>;
    /**
     * Check eligibility, then create order and choose checkout flow automatically:
     * - If `paymentReady === true` → {@link createOrderAndShowPrimerCheckout} (Primer `Order` or WebView result).
     * - If `paymentReady` is false or absent → {@link createOrder}; use {@link initializeCheckoutWebView} for WebView checkout.
     */
    createOrderWithEligibilityCheck(request: CreateBuyOrderRequest): Promise<Order | PrimerCheckoutWebViewResult>;
    /**
     * Create a new buy order
     */
    createOrder(request: CreateBuyOrderRequest): Promise<Order>;
    /**
     * Create a buy order and show the Primer checkout flow for the chosen payment method.
     * If the order has `nativeToken`, presents Primer and returns the `Order`.
     * If there is no `nativeToken` but `checkoutUrl` is present, returns {@link PrimerCheckoutWebViewResult}
     * so you can render `<CheckoutWebView {...webViewProps} />`.
     * @param options - `paymentMethod` for Primer (default `card`); `webViewProps` extras when falling back to WebView.
     */
    createOrderAndShowPrimerCheckout(request: CreateBuyOrderRequest, options?: PrimerCheckoutFlowOptions): Promise<CreateOrderAndShowPrimerCheckoutResult>;
    /**
     * Get buy order details by order ID
     */
    getOrder(orderId: string): Promise<Order>;
    /**
     * Get buy orders by account reference
     */
    getOrdersByAccount(externalCustomerId: string, perPage?: number, page?: number): Promise<Order[]>;
    /**
     * Get WebView props for initializing a checkout WebView from an order
     */
    initializeCheckoutWebView(order: Order, additionalProps?: Omit<CheckoutWebViewProps, 'checkoutUrl' | 'visible'>): CheckoutWebViewProps;
}
