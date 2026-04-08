# Testing Guide

This document describes the testing setup and test coverage for the Banxa React Native SDK.

## Test Setup

The SDK uses [Jest](https://jestjs.io/) as the testing framework with TypeScript support via `ts-jest`.

### Installation

To install test dependencies:

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run live Banxa API tests (requires .env with BANXA_API_KEY and BANXA_PARTNER)
npm run test:api
```

## Live API Tests

`banxa-api.test.ts` calls the real Banxa API through the SDK. These tests are **skipped** unless credentials are configured.

1. Copy `.env.example` to `.env`.
2. Set `BANXA_API_KEY` and `BANXA_PARTNER` (from the Banxa Partner Dashboard).
3. Set `BANXA_ENVIRONMENT=sandbox` for testing.
4. Run `npm run test:api`. If `.env` is missing or variables are unset, the suite is skipped.

## Test Structure

Tests are located in `src/__tests__/` directory:

- `banxa-api.test.ts` - Live API tests (skipped when env vars not set)
- `apiClient.test.ts` - Tests for the core API client
- `banxa.test.ts` - Tests for the main Banxa class
- `buy.test.ts` - Tests for the Buy module
- `sell.test.ts` - Tests for the Sell module
- `prices.test.ts` - Tests for the Prices module
- `paymentMethods.test.ts` - Tests for the Payment Methods module
- `countries.test.ts` - Tests for the Countries module
- `currencies.test.ts` - Tests for the Currencies module
- `customerIdentity.test.ts` - Tests for the Customer Identity module
- `errors.test.ts` - Tests for error handling
- `integration.test.ts` - Integration tests for end-to-end flows

## Test Coverage

### ApiClient Tests
- ✅ Constructor with different configurations
- ✅ GET requests with query parameters
- ✅ POST requests with body
- ✅ Error handling (HTTP errors, network errors, JSON parse errors)
- ✅ Request headers and authentication

### Buy Module Tests
- ✅ Create buy order
- ✅ Check buy eligibility
- ✅ Get buy order by ID
- ✅ Get buy orders by account reference
- ✅ Pagination support
- ✅ Initialize checkout WebView
- ✅ Create order and show Primer checkout
- ✅ Error handling

### Sell Module Tests
- ✅ Create sell order
- ✅ Check sell eligibility
- ✅ Get sell order by ID
- ✅ Get sell orders by account reference
- ✅ Initialize checkout WebView
- ✅ Error handling

### Prices Module Tests
- ✅ Get quote (by order type: buy/sell)
- ✅ Get buy quote
- ✅ Get sell quote
- ✅ Optional parameters handling

### Payment Methods Module Tests
- ✅ Get all payment methods
- ✅ Filter payment methods by currency pair
- ✅ Get payment method by ID

### Countries Module Tests
- ✅ Get all countries
- ✅ Get country by code

### Currencies Module Tests
- ✅ Get all currencies
- ✅ Filter by type (fiat/crypto)
- ✅ Get currency by code
- ✅ Get fiat currencies
- ✅ Get crypto currencies

### Customer Identity Module Tests
- ✅ Register customer identity
- ✅ Get customer identity by account reference
- ✅ Minimal request handling

### Banxa Main Class Tests
- ✅ Initialization with all modules
- ✅ Configuration validation
- ✅ Module access
- ✅ Error handling for missing config

### Error Handling Tests
- ✅ BanxaSDKError creation
- ✅ Error properties (message, code, statusCode)
- ✅ Prototype chain maintenance

### Live API Tests (banxa-api.test.ts)
- ✅ Skipped when BANXA_API_KEY or BANXA_PARTNER not set
- ✅ Prices: getQuote, getBuyQuote, getSellQuote
- ✅ Payment methods: getPaymentMethods (with and without filter)
- ✅ Countries: getCountries, getCountry by code
- ✅ Currencies: getFiatCurrencies, getCryptoCurrencies, getCurrency by code
- ✅ Buy: checkEligibility
- ✅ Sell: checkEligibility

### Integration Tests
- ✅ End-to-end order flow
- ✅ Quote and order flow integration

## Mocking

The tests use Jest mocks for:
- `fetch` API (global mock)
- `ApiClient` class (module mock)

## Code Quality

All test files follow these principles:
- ✅ Clear test descriptions
- ✅ Isolated test cases
- ✅ Proper setup and teardown
- ✅ Mock data that matches API responses
- ✅ Error case coverage

## Notes

- React and React Native are peer dependencies, so TypeScript may show errors in `CheckoutWebView.tsx` during development. These will be resolved when the SDK is used in a React Native project.
- Tests use mocked API responses to avoid actual network calls.
- Integration tests verify that modules work together correctly.



