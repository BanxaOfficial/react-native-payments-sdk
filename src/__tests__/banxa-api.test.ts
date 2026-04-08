/**
 * Live Banxa API tests. Call the real API through the SDK.
 * Skipped when BANXA_API_KEY or BANXA_PARTNER are not set (e.g. copy .env.example to .env).
 * Order-creation tests (buy/sell createOrder) run only when BANXA_RUN_ORDER_TESTS=1 (sandbox recommended).
 * A 404 from the API will fail the test.
 */

import { Banxa } from '../banxa';

const hasApiCredentials =
  process.env.BANXA_API_KEY && process.env.BANXA_PARTNER;

const runOrderTests =
  hasApiCredentials &&
  (process.env.BANXA_RUN_ORDER_TESTS === '1' || process.env.BANXA_RUN_ORDER_TESTS === 'true');

const describeLive = hasApiCredentials ? describe : describe.skip;
const describeOrderCreation = runOrderTests ? describe : describe.skip;

function getConfig() {
  return {
    apiKey: process.env.BANXA_API_KEY!,
    partner: process.env.BANXA_PARTNER!,
    environment: (process.env.BANXA_ENVIRONMENT as 'sandbox' | 'production' | 'local') || 'sandbox',
  };
}

describeLive('Banxa API (live)', () => {
  let banxa: Banxa;

  beforeAll(() => {
    banxa = new Banxa(getConfig());
  });

  describe('quotes', () => {
    it('should get buy quote for USD/BTC', async () => {
      const quote = await banxa.prices.getBuyQuote({
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        paymentMethodId: 'debit-credit-card',
        blockchain: 'BTC',
      });
      expect(quote).toBeDefined();
      expect(quote).toHaveProperty('fiatAmount');
      expect(quote).toHaveProperty('cryptoAmount');
      expect(quote).toHaveProperty('paymentMethodId');
      expect(quote).toHaveProperty('processingFee');
      expect(quote).toHaveProperty('networkFee');
    }, 15000);

    it.skip('should get sell quote for BTC/USD', async () => {
      // Banxa API returns "Validation error: paymentMethodId" for sell quotes with
      // payment methods from getPaymentMethods('BTC','USD') (type or id). Buy quote works.
      const methods = await banxa.paymentMethods.getPaymentMethods('BTC', 'USD');
      expect(methods.length).toBeGreaterThan(0);
      const paymentMethodId = methods[0].type ?? String(methods[0].id);
      const quote = await banxa.prices.getSellQuote({
        fiat: 'USD',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        paymentMethodId,
        blockchain: 'BTC',
      });
      expect(quote).toBeDefined();
      expect(quote).toHaveProperty('fiatAmount');
      expect(quote).toHaveProperty('cryptoAmount');
    }, 15000);
  });

  describe('payment methods', () => {
    it('should get payment methods', async () => {
      const methods = await banxa.paymentMethods.getPaymentMethods();
      expect(methods).toBeDefined();
      expect(Array.isArray(methods)).toBe(true);
    }, 15000);

    it('should get payment methods filtered by source and target', async () => {
      const methods = await banxa.paymentMethods.getPaymentMethods('USD', 'BTC');
      expect(methods).toBeDefined();
      expect(Array.isArray(methods)).toBe(true);
    }, 15000);
  });

  describe('countries', () => {
    it('should get countries', async () => {
      const countries = await banxa.countries.getCountries();
      expect(countries).toBeDefined();
      expect(Array.isArray(countries)).toBe(true);
      if (countries.length > 0) {
        const first = countries[0] as unknown as Record<string, unknown>;
        expect(first.code !== undefined || first.id !== undefined).toBe(true);
        expect(first.name !== undefined || first.description !== undefined).toBe(true);
      }
    }, 15000);

    it('should get country by code', async () => {
      const country = await banxa.countries.getCountry('US');
      expect(country).toBeDefined();
      expect(country).toHaveProperty('code');
      expect(country).toHaveProperty('name');
      expect(country.code).toBe('US');
    }, 15000);
  });

  describe('currencies', () => {
    it('should get fiat currencies', async () => {
      const fiats = await banxa.currencies.getFiatCurrencies();
      expect(fiats).toBeDefined();
      expect(Array.isArray(fiats)).toBe(true);
      if (fiats.length > 0) {
        expect(fiats[0]).toHaveProperty('id');
        expect(fiats[0]).toHaveProperty('description');
        expect(fiats[0]).toHaveProperty('symbol');
        expect(fiats[0]).toHaveProperty('supportedPaymentMethods');
      }
    }, 15000);

    it('should get crypto currencies', async () => {
      const cryptos = await banxa.currencies.getCryptoCurrencies();
      expect(cryptos).toBeDefined();
      expect(Array.isArray(cryptos)).toBe(true);
      if (cryptos.length > 0) {
        expect(cryptos[0]).toHaveProperty('id');
        expect(cryptos[0]).toHaveProperty('description');
        expect(cryptos[0]).toHaveProperty('blockchains');
      }
    }, 15000);
  });

  describe('buy', () => {
    it.skip('should check buy eligibility', async () => {
      const eligibility = await banxa.buy.checkEligibility({
        externalCustomerId: 'sdk-test-' + Date.now(),
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '50',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://example.com/return',
      });
      expect(eligibility).toBeDefined();
      expect(eligibility).toHaveProperty('eligible');
    }, 15000);
  });

  describeOrderCreation('buy order creation', () => {
    it('should create a buy order and return order with id and checkout', async () => {
      const externalCustomerId = 'sdk-test-' + Date.now();
      const order = await banxa.buy.createOrder({
        externalCustomerId,
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '25',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://example.com/return',
      });
      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(typeof order.id).toBe('string');
      expect(order.id.length).toBeGreaterThan(0);
      expect(order.orderType === 'BUY' || order.orderType === undefined).toBe(true);
      expect(order.fiat === 'USD' || order.fiat === undefined).toBe(true);
      expect(order.crypto === 'BTC' || order.crypto === undefined).toBe(true);
      expect(order.checkoutUrl != null || order.nativeToken != null).toBe(true);
    }, 20000);
  });

  describe('sell', () => {
    it.skip('should check sell eligibility', async () => {
      const eligibility = await banxa.sell.checkEligibility({
        externalCustomerId: 'sdk-test-' + Date.now(),
        fiat: 'USD',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://example.com/return',
      });
      expect(eligibility).toBeDefined();
      expect(eligibility).toHaveProperty('eligible');
    }, 15000);
  });

  describeOrderCreation('sell order creation', () => {
    it('should create a sell order and return order with id and checkout', async () => {
      const externalCustomerId = 'sdk-test-' + Date.now();
      const order = await banxa.sell.createOrder({
        externalCustomerId,
        fiat: 'USD',
        crypto: 'BTC',
        cryptoAmount: '0.0001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://example.com/return',
      });
      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(typeof order.id).toBe('string');
      expect(order.id.length).toBeGreaterThan(0);
      expect(order.orderType === 'SELL' || order.orderType === undefined).toBe(true);
      expect(order.fiat === 'USD' || order.fiat === undefined).toBe(true);
      expect(order.crypto === 'BTC' || order.crypto === undefined).toBe(true);
      expect(order.checkoutUrl != null || order.nativeToken != null).toBe(true);
    }, 20000);
  });
});
