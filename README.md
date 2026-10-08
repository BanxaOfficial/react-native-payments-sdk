# Banxa React Native SDK

A TypeScript-based React Native SDK for integrating with the Banxa API. This SDK provides a simple and type-safe interface for creating orders, retrieving prices, managing payment methods, and more.

## Installation

```bash
npm install @banxa/react-native-sdk
npm install @primer-io/react-native
```

or

```bash
yarn add @banxa/react-native-sdk
yarn add @primer-io/react-native
```

### Using the SDK from a local path (e.g. `file:../react-native-sdk` or `npm link`)

The package’s `main` entry is the built output in `lib/`. If you install from a local path, build the SDK first so `lib/index.js` exists:

```bash
cd /path/to/react-native-sdk && npm run build
```

Then install or link from your app as usual.

## Getting Started

### Basic Setup

```typescript
import { Banxa } from '@banxa/react-native-sdk';

const banxa = new Banxa({
  apiKey: 'your-api-key',
  partner: 'your-partner-id',
  environment: 'production', // or 'sandbox'
});
```

### Configuration Options

- `apiKey` (required): Your Banxa API key from the Partner Dashboard
- `partner` (required): Your partner identifier
- `environment` (optional): `'production'`, `'sandbox'` (default: `'production'`)
- `baseUrl` (optional): Custom base URL (overrides environment setting)
- `primerCallbacks` (optional): Primer checkout callbacks (`onCheckoutComplete`, `onError`, `onDismiss`); when omitted, the SDK uses simple `console.log` defaults
- `primerSettings` (optional): Primer base settings (e.g. `uiOptions`, `paymentMethodOptions`) passed to all Primer flows

## API Modules

### Buy

Create and manage **buy** orders (fiat → crypto). Endpoints use the `/buy` path:

```typescript
// Create a new buy order (parameters match Banxa API)
const order = await banxa.buy.createOrder({
  externalCustomerId: 'user-123',
  fiat: 'USD',
  crypto: 'BTC',
  fiatAmount: '100',
  paymentMethodId: '1',
  walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  redirectUrl: 'https://yourapp.com/success',
});

console.log('Order created:', order.id);
console.log('Checkout URL:', order.checkoutUrl);

// Call eligibility with the same params as createOrder; branch on paymentReady for checkout flow
const orderRequest = {
  externalCustomerId: 'user-123',
  fiat: 'USD',
  crypto: 'BTC',
  fiatAmount: '100',
  paymentMethodId: '1',
  walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  redirectUrl: 'https://yourapp.com/success',
};
const eligibility = await banxa.buy.checkEligibility(orderRequest);
// Use paymentReady from the eligibility response to choose Primer vs WebView checkout (do not rely on other fields for gating).
if (eligibility.paymentReady) {
  const checkoutResult = await banxa.buy.createOrderAndShowPrimerCheckout(orderRequest);
  // Primer: checkoutResult is Order; WebView fallback: { order, webViewProps }
} else {
  const order = await banxa.buy.createOrder(orderRequest);
  const webViewProps = banxa.buy.initializeCheckoutWebView(order, { ... });
  // render <CheckoutWebView {...webViewProps} />
}

// Get buy order details
const orderDetails = await banxa.buy.getOrder(order.id);

// Get buy orders by external customer ID
const userBuyOrders = await banxa.buy.getOrdersByAccount('user-123');

// Initialize WebView for checkout
import { CheckoutWebView } from '@banxa/react-native-sdk';
import { useState } from 'react';

const [showCheckout, setShowCheckout] = useState(false);

const webViewProps = banxa.buy.initializeCheckoutWebView(order, {
  onClose: () => setShowCheckout(false),
  onSuccess: (url) => {
    console.log('Payment successful!', url);
    setShowCheckout(false);
  },
  onFailure: (url) => {
    console.log('Payment failed', url);
    setShowCheckout(false);
  },
  returnUrlOnSuccess: 'https://yourapp.com/success',
  returnUrlOnFailure: 'https://yourapp.com/failure',
});

// In your component render:
{showCheckout && <CheckoutWebView {...webViewProps} />}
```

#### Create buy order and show Primer checkout

When the Banxa create order API returns a `nativeToken` (e.g. for card/Primer flows), you can create a buy order and present Primer in one call. Pass `paymentMethod` to choose the flow (default is `card`).

```typescript
import {
  isPrimerCheckoutWebViewResult,
  type PrimerCheckoutPaymentMethod,
} from '@banxa/react-native-sdk';

const result = await banxa.buy.createOrderAndShowPrimerCheckout(orderRequest);

if (isPrimerCheckoutWebViewResult(result)) {
  // No nativeToken but checkoutUrl — use WebView
  const { order, webViewProps } = result;
  // e.g. <CheckoutWebView {...webViewProps} />
} else {
  // Primer was shown; `result` is the Order
  const order = result;
}

// Or pick Primer flow explicitly: 'card' | 'applePay' | 'googlePay' | 'universal'
const method: PrimerCheckoutPaymentMethod = 'applePay';
await banxa.buy.createOrderAndShowPrimerCheckout(orderRequest, {
  paymentMethod: method,
  callbacks: { onCheckoutComplete: () => {}, onError: () => {}, onDismiss: () => {} },
  // When falling back to WebView, optional extras for CheckoutWebView:
  webViewProps: { returnUrlOnSuccess: 'https://yourapp.com/success', onClose: () => {} },
});
```

If the order has neither `nativeToken` nor `checkoutUrl`, the method throws.

### Sell

Create and manage **sell** orders (crypto → fiat). Endpoints use the `/sell` path:

```typescript
// Create a new sell order (parameters match Banxa API)
const order = await banxa.sell.createOrder({
  externalCustomerId: 'user-123',
  fiat: 'USD',
  crypto: 'BTC',
  cryptoAmount: '0.001',
  paymentMethodId: '1',
  walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  redirectUrl: 'https://yourapp.com/success',
});

// Check sell eligibility
const eligibility = await banxa.sell.checkEligibility({ ... });

// Get sell order details
const orderDetails = await banxa.sell.getOrder(order.id);

// Get sell orders by external customer ID
const userSellOrders = await banxa.sell.getOrdersByAccount('user-123');

// Initialize WebView for checkout (same as buy)
const webViewProps = banxa.sell.initializeCheckoutWebView(order, { ... });
```

Sell orders can use the same `createOrderAndShowPrimerCheckout` API as buy: Primer when `nativeToken` is present, otherwise `{ order, webViewProps }` when `checkoutUrl` is present (see buy example and `isPrimerCheckoutWebViewResult`).

### Prices

Get quotes for buy or sell (GET /quotes/buy or /quotes/sell). Either `fiatAmount` or `cryptoAmount` must be provided; you must also include `paymentMethodId` and `blockchain`:

```typescript
// Get a quote by order type (buy or sell)
const quote = await banxa.prices.getQuote('buy', {
  fiat: 'USD',
  crypto: 'BTC',
  fiatAmount: '100',
  paymentMethodId: '1',
  blockchain: 'bitcoin',
});

console.log('Crypto amount:', quote.cryptoAmount);
console.log('Fiat amount:', quote.fiatAmount);
console.log('Processing fee:', quote.processingFee);
console.log('Network fee:', quote.networkFee);

// Convenience: buy quote (GET /quotes/buy)
const buyQuote = await banxa.prices.getBuyQuote({
  fiat: 'USD',
  crypto: 'BTC',
  fiatAmount: '100',
  paymentMethodId: '1',
  blockchain: 'bitcoin',
});

// Convenience: sell quote (GET /quotes/sell)
const sellQuote = await banxa.prices.getSellQuote({
  fiat: 'USD',
  crypto: 'BTC',
  cryptoAmount: '0.001',
  paymentMethodId: '1',
  blockchain: 'bitcoin',
});
```

### Payment Methods

Retrieve available payment methods:

```typescript
// Get all payment methods
const paymentMethods = await banxa.paymentMethods.getPaymentMethods();

// Get payment methods for a specific currency pair
const methods = await banxa.paymentMethods.getPaymentMethods('USD', 'BTC');

// Get a specific payment method
const method = await banxa.paymentMethods.getPaymentMethod(1);
```

### Countries

Get supported countries:

```typescript
// Get all countries
const countries = await banxa.countries.getCountries();

// Get a specific country
const country = await banxa.countries.getCountry('US');
```

### Currencies

Fiat and crypto lists come from separate endpoints (`GET /fiats/{orderType}` and `GET /crypto/{orderType}`). Availability can differ for buy vs sell:

```typescript
// Fiat and crypto for buy (convenience wrappers default to order type "buy")
const fiatCurrencies = await banxa.currencies.getFiatCurrencies();
const cryptoCurrencies = await banxa.currencies.getCryptoCurrencies();

// Same data with an explicit order type (use 'sell' when listing for sell flows)
const sellFiats = await banxa.currencies.getFiats('sell');
const sellCrypto = await banxa.currencies.getCrypto('sell');

// Look up a crypto by id from the list (there is no single-currency endpoint)
const btc = cryptoCurrencies.find((c) => c.id === 'BTC');
```

### Customer Identity

Register and manage customer identity for KYC:

```typescript
// Register customer identity
const identity = await banxa.customerIdentity.registerCustomerIdentity({
  account_reference: 'user-123',
  email: 'user@example.com',
  mobile: '+1234567890',
  given_name: 'John',
  surname: 'Doe',
  date_of_birth: '1990-01-01',
  address: {
    address_line_1: '123 Main St',
    city: 'New York',
    state: 'NY',
    post_code: '10001',
    country_code: 'US',
  },
  kyc_level: 1,
});

// Get customer identity
const customerIdentity = await banxa.customerIdentity.getCustomerIdentity('user-123');
```

### Hosted KYC

Verify a customer **before any order exists**, so native payments aren't gated behind the partner running their own KYC. `createSession` is idempotent per `(merchant, externalCustomerId)` for one hour — retrying on a remount is safe and returns the original link.

```typescript
import { HostedKycWebView } from '@banxa/react-native-sdk';

// Create the session — prefer creating this on your backend and passing the result to the
// app, since createSession() ships your partner API key to wherever it's called.
const returnUrl = 'https://yourapp.com/kyc-return'; // or a deep link, e.g. 'myapp://kyc-return'
const session = await banxa.kyc.createSession({
  externalCustomerId: 'user-123',
  tier: 'standard', // 'standard' | 'express' | 'enhanced', defaults to 'standard'
  country: 'US',
  returnUrl,
});

const webViewProps = banxa.kyc.initializeHostedKycWebView(session, {
  onClose: () => setShowKyc(false),
  onComplete: () => {
    // The customer finished the flow. 
    setShowKyc(false);
  },
  onError: (error) => console.log('KYC error', error.code, error.message),
  returnUrl,
});

// In your component render:
{showKyc && <HostedKycWebView {...webViewProps} />}
```

Completion arrives on whichever channel fires first:

- **`onComplete`** fires from a `banxa:kyc-complete` message posted by the hosted flow — only sent for merchants with the embedded iframe integration enabled.
- Otherwise, completion is detected when the flow navigates to your `returnUrl` (pass it to `initializeHostedKycWebView`/`HostedKycWebView` so the WebView can match it).

Both are wired automatically; you don't need to choose one.

#### Camera and microphone

The verification flow captures documents and a liveness video inside the WebView, so both platforms need explicit permission wiring — without it, capture fails silently:

- **iOS**: add `NSCameraUsageDescription` and `NSMicrophoneUsageDescription` to your app's `Info.plist`. `HostedKycWebView` already sets `mediaCapturePermissionGrantType="grant"` on the WebView; without the `Info.plist` keys, iOS refuses the grant regardless.
- **Android**: declare `<uses-permission android:name="android.permission.CAMERA" />` and `<uses-permission android:name="android.permission.RECORD_AUDIO" />` in `AndroidManifest.xml`. `react-native-webview` requests the runtime grant automatically once the app holds these — no extra code needed on your side.

## Error Handling

The SDK throws `BanxaSDKError` for API and network failures (this class implements the `BanxaError` shape from the type definitions):

```typescript
import { Banxa, BanxaSDKError } from '@banxa/react-native-sdk';

try {
  const order = await banxa.buy.createOrder({...});
} catch (error) {
  if (error instanceof BanxaSDKError) {
    console.error('Banxa API Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('Status Code:', error.statusCode);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { Banxa, Order, Quote, PaymentMethod } from '@banxa/react-native-sdk';

const banxa = new Banxa({...});

// All methods are fully typed
const order: Order = await banxa.buy.createOrder({...});
const quote: Quote = await banxa.prices.getBuyQuote({...});
```

## React Native Compatibility

This SDK uses the standard `fetch` API which is available in React Native. Peer dependencies (see `package.json`): `react-native-webview` for `CheckoutWebView`, and `@primer-io/react-native` for Primer checkout flows.

### Installing WebView Dependency

```bash
npm install react-native-webview @primer-io/react-native
# or
yarn add react-native-webview @primer-io/react-native
```

For iOS, you may need to run:
```bash
cd ios && pod install
```

## Testing

The SDK includes comprehensive test coverage. To run tests:

```bash
npm test
```

For more details, see [TESTING.md](./TESTING.md).

## License

MIT

## Support

For API documentation, visit [docs.banxa.com](https://docs.banxa.com)

For issues and questions, please contact Banxa support or open an issue in the repository.

