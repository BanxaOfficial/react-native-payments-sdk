/**
 * Integration tests for the Banxa SDK
 * These tests verify that modules work together correctly
 */

import { Banxa } from '../banxa';
import { BanxaConfig } from '../types';
import { ApiClient } from '../client/apiClient';

// Mock fetch globally for integration tests
global.fetch = jest.fn();

describe('Banxa SDK Integration', () => {
  const mockConfig: BanxaConfig = {
    apiKey: 'test-api-key',
    partner: 'test-partner',
    environment: 'production',
  };

  let banxa: Banxa;

  beforeEach(() => {
    banxa = new Banxa(mockConfig);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('end-to-end order flow', () => {
    it('should create order and initialize WebView', async () => {
      const mockOrder = {
        id: 'order-123',
        externalCustomerId: 'user-123',
        orderType: 'BUY' as const,
        fiat: 'USD',
        fiatAmount: '100',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        paymentMethodId: 1,
        paymentMethodType: 'card',
        status: 'pendingPayment' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        checkoutUrl: 'https://checkout.banxa.com/order-123',
      };

      // Mock createOrder
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockOrder }),
      });

      const order = await banxa.buy.createOrder({
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://app.com/return',
      });

      expect(order.checkoutUrl).toBeDefined();

      // Initialize WebView
      const webViewProps = banxa.buy.initializeCheckoutWebView(order, {
        onClose: jest.fn(),
      });

      expect(webViewProps.checkoutUrl).toBe(mockOrder.checkoutUrl);
      expect(webViewProps.visible).toBe(true);
    });
  });

  describe('quote and order flow', () => {
    it('should get quote then create order', async () => {
      const mockQuote = {
        paymentMethodId: 'debit-credit-card',
        cryptoAmount: '0.002',
        fiatAmount: '100.00',
        processingFee: '0.92',
        networkFee: '1.67',
      };

      // Mock getQuote
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockQuote }),
      });

      const quote = await banxa.prices.getBuyQuote({
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        paymentMethodId: 'debit-credit-card',
        blockchain: 'BTC',
      });
      expect(quote.fiatAmount).toBe('100.00');
      expect(quote.cryptoAmount).toBe('0.002');

      // Mock createOrder
      const mockOrder = {
        id: 'order-123',
        externalCustomerId: 'user-123',
        orderType: 'BUY' as const,
        fiat: 'USD',
        fiatAmount: '100',
        crypto: 'BTC',
        cryptoAmount: '0.002',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        paymentMethodId: 1,
        paymentMethodType: 'card',
        status: 'pendingPayment' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        checkoutUrl: 'https://checkout.banxa.com/order-123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockOrder }),
      });

      const order = await banxa.buy.createOrder({
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        paymentMethodId: quote.paymentMethodId,
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://app.com/return',
      });

      expect(order.paymentMethodId).toBe(1);
    });
  });
});



