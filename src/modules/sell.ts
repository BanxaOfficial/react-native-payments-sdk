import { ApiClient } from '../client/apiClient';
import {
  CreateSellOrderRequest,
  Order,
  OrderEligibilityResponse,
  BanxaResponse,
  PrimerCheckoutFlowOptions,
  CreateOrderAndShowPrimerCheckoutResult,
  PrimerCheckoutWebViewResult,
} from '../types';
import { unwrapResponse } from '../utils/unwrapApiResponse';
import { CheckoutWebViewProps } from '../components/CheckoutWebView';
import { PrimerCheckoutWrapper } from '../primer/PrimerCheckoutWrapper';

const BASE = '/sell';

export class SellModule {
  private primerCheckout: PrimerCheckoutWrapper;

  constructor(
    private client: ApiClient,
    options?: { primerCheckout?: PrimerCheckoutWrapper }
  ) {
    this.primerCheckout = options?.primerCheckout ?? new PrimerCheckoutWrapper({
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
  async checkEligibility(
    request: CreateSellOrderRequest
  ): Promise<OrderEligibilityResponse> {
    const response = await this.client.post<
      BanxaResponse<OrderEligibilityResponse> | OrderEligibilityResponse
    >('/eligibility', { ...request, orderTypeId: 'sell' });
    return unwrapResponse(response);
  }

  /**
   * Check eligibility, then create order and choose checkout flow automatically:
   * - If `paymentReady === true` → {@link createOrderAndShowPrimerCheckout} (Primer `Order` or WebView result).
   * - If `paymentReady` is false or absent → {@link createOrder}; use {@link initializeCheckoutWebView} for WebView checkout.
   */
  async createOrderWithEligibilityCheck(
    request: CreateSellOrderRequest
  ): Promise<Order | PrimerCheckoutWebViewResult> {
    const eligibility = await this.checkEligibility(request);
    if (eligibility.paymentReady === true) {
      return this.createOrderAndShowPrimerCheckout(request);
    }
    return this.createOrder(request);
  }

  /**
   * Create a new sell order
   */
  async createOrder(request: CreateSellOrderRequest): Promise<Order> {
    const response = await this.client.post<BanxaResponse<Order> | Order>(
      BASE,
      request
    );
    return unwrapResponse(response);
  }

  /**
   * Create a sell order and show the Primer checkout flow for the chosen payment method.
   * If the order has `nativeToken`, presents Primer and returns the `Order`.
   * If there is no `nativeToken` but `checkoutUrl` is present, returns {@link PrimerCheckoutWebViewResult}.
   * @param options - `paymentMethod` for Primer (default `card`); `webViewProps` extras when falling back to WebView.
   */
  async createOrderAndShowPrimerCheckout(
    request: CreateSellOrderRequest,
    options?: PrimerCheckoutFlowOptions
  ): Promise<CreateOrderAndShowPrimerCheckoutResult> {
    const order = await this.createOrder(request);
    if (!order.nativeToken) {
      if (!order.checkoutUrl) {
        throw new Error(
          'Order response has no nativeToken and no checkoutUrl; cannot start Primer or WebView checkout.'
        );
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
   * Get sell order details by order ID
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await this.client.get<BanxaResponse<Order> | Order>(
      `${BASE}/${orderId}`
    );
    return unwrapResponse(response);
  }

  /**
   * Get sell orders by account reference
   */
  async getOrdersByAccount(
    externalCustomerId: string,
    perPage: number = 50,
    page: number = 1
  ): Promise<Order[]> {
    const response = await this.client.get<BanxaResponse<Order[]> | Order[]>(BASE, {
      externalCustomerId,
      per_page: perPage,
      page,
    });
    return unwrapResponse(response);
  }

  /**
   * Get WebView props for initializing a checkout WebView from an order
   */
  initializeCheckoutWebView(
    order: Order,
    additionalProps?: Omit<CheckoutWebViewProps, 'checkoutUrl' | 'visible'>
  ): CheckoutWebViewProps {
    if (!order.checkoutUrl) {
      throw new Error('Order does not have a checkout URL');
    }

    return {
      checkoutUrl: order.checkoutUrl,
      visible: true,
      returnUrlOnSuccess: additionalProps?.returnUrlOnSuccess,
      returnUrlOnFailure: additionalProps?.returnUrlOnFailure,
      returnUrlOnCancelled: additionalProps?.returnUrlOnCancelled,
      onClose: additionalProps?.onClose || (() => {}),
      onSuccess: additionalProps?.onSuccess,
      onFailure: additionalProps?.onFailure,
      onCancelled: additionalProps?.onCancelled,
      onNavigationStateChange: additionalProps?.onNavigationStateChange,
    };
  }
}
