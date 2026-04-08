import type { PrimerSettings } from '@primer-io/react-native';
import type { CheckoutWebViewProps } from '../components/CheckoutWebView';
/** Primer checkout callbacks; pass via BanxaConfig.primerCallbacks or per-call options so the app receives events (defaults use console.log). */
export interface PrimerCallbacks {
    onCheckoutComplete?: (checkoutData: unknown) => void;
    onError?: (error: {
        description?: string;
    }) => void;
    onDismiss?: () => void;
}
/**
 * Which Primer native checkout UI to present after creating an order with `nativeToken`.
 * - `card` — card / payment-method sheet (`showPaymentMethod`)
 * - `applePay` / `googlePay` — headless native wallet flows
 * - `universal` — full Primer Universal Checkout (all methods)
 */
export type PrimerCheckoutPaymentMethod = 'card' | 'applePay' | 'googlePay' | 'universal';
/** Options for createOrderAndShowPrimerCheckout (buy / sell). */
export interface PrimerCheckoutFlowOptions {
    /**
     * Primer presentation to use. Defaults to `card`.
     */
    paymentMethod?: PrimerCheckoutPaymentMethod;
    /** Overrides BanxaConfig.primerCallbacks for this call only. */
    callbacks?: PrimerCallbacks;
    /**
     * Primer `paymentMethodType` when using `card` (e.g. from your client session).
     * If omitted, the SDK resolves the card type via Headless.
     */
    paymentMethodType?: string;
    /**
     * When the order has no `nativeToken` but has `checkoutUrl`, merged into the returned
     * {@link PrimerCheckoutWebViewResult.webViewProps} (same shape as `initializeCheckoutWebView` extras).
     */
    webViewProps?: Omit<CheckoutWebViewProps, 'checkoutUrl' | 'visible'>;
}
export interface BanxaConfig {
    apiKey: string;
    partner: string;
    environment?: 'sandbox' | 'production' | 'local' | 'preprod';
    baseUrl?: string;
    /** Primer checkout callbacks. When provided, these are used instead of SDK defaults (console.log). */
    primerCallbacks?: PrimerCallbacks;
    /** Primer base settings (e.g. uiOptions, paymentMethodOptions). Applied to all Primer checkout flows. */
    primerSettings?: Partial<PrimerSettings>;
}
export interface BanxaError {
    message: string;
    code?: string;
    statusCode?: number;
    /** Original error (e.g. network failure) when this error wraps another. */
    cause?: unknown;
    /** Full error payload from the API when present (e.g. validation errors). */
    details?: Record<string, unknown>;
}
export interface BanxaResponse<T> {
    data: T;
    message?: string;
}
/** Request body for POST /buy. Either fiatAmount or cryptoAmount must be provided. */
export interface CreateBuyOrderRequest {
    externalCustomerId: string;
    fiat: string;
    crypto: string;
    fiatAmount?: string;
    cryptoAmount?: string;
    walletAddress: string;
    walletAddressTag?: string;
    redirectUrl: string;
    paymentMethodId?: string;
    blockchain?: string;
    metadata?: string;
    externalOrderId?: string;
    subPartnerId?: string;
    discountCode?: string;
    email?: string;
}
/** Request body for POST /sell. Either fiatAmount or cryptoAmount must be provided. */
export interface CreateSellOrderRequest {
    externalCustomerId: string;
    fiat: string;
    crypto: string;
    fiatAmount?: string;
    cryptoAmount?: string;
    walletAddress: string;
    walletAddressTag?: string;
    redirectUrl: string;
    paymentMethodId?: string;
    blockchain?: string;
    metadata?: string;
    externalOrderId?: string;
    subPartnerId?: string;
}
export interface OrderEligibilityResponse {
    eligible: boolean;
    paymentReady?: boolean;
    message?: string;
}
/** Order as returned by Banxa API (camelCase) */
export interface Order {
    id: string;
    externalCustomerId?: string;
    externalOrderId?: string;
    orderType?: 'BUY' | 'SELL';
    fiat?: string;
    fiatAmount?: string;
    crypto?: string;
    cryptoAmount?: string;
    walletAddress?: string;
    walletAddressTag?: string;
    paymentMethodId?: number;
    paymentMethodType?: string;
    status?: OrderStatus;
    createdAt?: string;
    updatedAt?: string;
    checkoutUrl?: string;
    nativeToken?: string;
    blockchain?: string;
}
/**
 * Returned by `createOrderAndShowPrimerCheckout` when the order has `checkoutUrl` but no `nativeToken`.
 * Render checkout with `<CheckoutWebView {...webViewProps} />` and keep `order` for your app state.
 */
export interface PrimerCheckoutWebViewResult {
    order: Order;
    webViewProps: CheckoutWebViewProps;
}
/** Result of createOrderAndShowPrimerCheckout: native Primer flow returns `Order`; WebView fallback returns props + order. */
export type CreateOrderAndShowPrimerCheckoutResult = Order | PrimerCheckoutWebViewResult;
/** Narrow `createOrderAndShowPrimerCheckout` / eligibility results to the WebView branch. */
export declare function isPrimerCheckoutWebViewResult(value: CreateOrderAndShowPrimerCheckoutResult): value is PrimerCheckoutWebViewResult;
export type OrderStatus = 'pendingPayment' | 'waitingPayment' | 'paymentReceived' | 'inProgress' | 'coinTransferred' | 'cancelled' | 'declined' | 'expired' | 'complete' | 'refunded';
export interface PrimerCheckoutOptions {
    onCheckoutComplete?: (checkoutData: unknown) => void;
    onError?: (error: unknown, checkoutData: unknown, handler?: {
        showErrorMessage: (message?: string) => void;
    }) => void;
}
/** Query params for GET /quotes/buy or GET /quotes/sell. Either fiatAmount or cryptoAmount must be provided. */
export interface GetQuoteRequest {
    fiat: string;
    crypto: string;
    fiatAmount?: string;
    cryptoAmount?: string;
    paymentMethodId: string;
    blockchain: string;
    externalCustomerId?: string;
    ipAddress?: string;
    discountCode?: string;
}
/** Discount info when discountCode is used (API shape; note orginalNetworkFee typo from API). */
export interface QuoteDiscountOriginalQuote {
    originalCryptoAmount: string;
    orginalNetworkFee: string;
    originalProcessingFee: string;
    originalFiatAmount: string;
}
export interface QuoteDiscount {
    originalQuote: QuoteDiscountOriginalQuote;
    discountCode: string;
}
/** Quote as returned by GET /quotes/{orderType} */
export interface Quote {
    paymentMethodId: string;
    cryptoAmount: string;
    fiatAmount: string;
    processingFee: string;
    networkFee: string;
    discount?: QuoteDiscount;
}
export interface PaymentMethod {
    id: number;
    type: string;
    name: string;
    logo: string;
    status: 'active' | 'inactive';
    supported_currencies: string[];
    supported_countries: string[];
}
export interface Country {
    code: string;
    name: string;
    is_supported: boolean;
}
export type OrderType = 'buy' | 'sell';
/** Fiat as returned by GET /fiats/{orderType} */
export interface FiatSupportedPaymentMethod {
    id: string;
    name: string;
    minimum: string;
    maximum: string;
}
export interface Fiat {
    id: string;
    description: string;
    symbol: string;
    supportedPaymentMethods: FiatSupportedPaymentMethod[];
}
/** Blockchain entry as returned in GET /crypto/{orderType} */
export interface CryptoBlockchain {
    id: string;
    description: string;
    isDefaultBlockchain: boolean;
    address: string | null;
    network: string | null;
    minimum: string;
    unsupportedCountries: Record<string, string[]>;
}
/** Crypto as returned by GET /crypto/{orderType} */
export interface Crypto {
    id: string;
    description: string;
    blockchains: CryptoBlockchain[];
}
export interface CustomerIdentityRequest {
    account_reference: string;
    email: string;
    mobile?: string;
    given_name?: string;
    surname?: string;
    date_of_birth?: string;
    address?: {
        address_line_1?: string;
        address_line_2?: string;
        city?: string;
        state?: string;
        post_code?: string;
        country_code?: string;
    };
    kyc_level?: number;
}
export interface CustomerIdentity {
    account_reference: string;
    identity_status: 'pending' | 'approved' | 'rejected';
    kyc_level: number;
    created_at: string;
    updated_at: string;
}
