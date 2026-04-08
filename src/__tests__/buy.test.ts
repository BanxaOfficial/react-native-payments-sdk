import { BuyModule } from '../modules/buy';
import { ApiClient } from '../client/apiClient';
import {
  CreateBuyOrderRequest,
  Order,
  OrderEligibilityResponse,
  BanxaResponse,
} from '../types';
import { BanxaSDKError } from '../errors';

jest.mock('../client/apiClient');

describe('BuyModule', () => {
  let buyModule: BuyModule;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({
      apiKey: 'test-key',
      partner: 'test-partner',
    }) as jest.Mocked<ApiClient>;
    buyModule = new BuyModule(mockApiClient);
  });

  describe('createOrder', () => {
    it('should create a buy order successfully', async () => {
      const request: CreateBuyOrderRequest = {
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://app.com/return',
      };

      const mockOrder: Order = {
        id: 'order-123',
        externalCustomerId: 'user-123',
        orderType: 'BUY',
        fiat: 'USD',
        fiatAmount: '100',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        paymentMethodId: 1,
        paymentMethodType: 'card',
        status: 'pendingPayment',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        checkoutUrl: 'https://checkout.banxa.com/order-123',
      };

      mockApiClient.post = jest.fn().mockResolvedValueOnce({ data: mockOrder });

      const result = await buyModule.createOrder(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/buy', request);
      expect(result).toEqual(mockOrder);
      expect(result.id).toBe('order-123');
      expect(result.checkoutUrl).toBe('https://checkout.banxa.com/order-123');
    });

    it('should handle API errors', async () => {
      const request: CreateBuyOrderRequest = {
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        walletAddress: '',
        redirectUrl: 'https://app.com/return',
      };

      mockApiClient.post = jest.fn().mockRejectedValueOnce(
        new BanxaSDKError('Invalid request', 'INVALID_REQUEST', 400)
      );

      await expect(buyModule.createOrder(request)).rejects.toThrow(BanxaSDKError);
    });
  });

  describe('checkEligibility', () => {
    it('should check buy eligibility', async () => {
      const request: CreateBuyOrderRequest = {
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://app.com/return',
      };

      const mockEligibility: OrderEligibilityResponse = {
        eligible: true,
      };

      mockApiClient.post = jest
        .fn()
        .mockResolvedValueOnce({ data: mockEligibility });

      const result = await buyModule.checkEligibility(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/eligibility', { ...request, orderTypeId: 'buy' });
      expect(result).toEqual(mockEligibility);
      expect(result.eligible).toBe(true);
    });

    it('should return paymentReady to indicate Primer vs WebView flow', async () => {
      const request: CreateBuyOrderRequest = {
        externalCustomerId: 'user-789',
        fiat: 'USD',
        crypto: 'BTC',
        walletAddress: '',
        redirectUrl: 'https://app.com/return',
      };

      const mockEligibility: OrderEligibilityResponse = {
        eligible: true,
        paymentReady: true,
      };

      mockApiClient.post = jest
        .fn()
        .mockResolvedValueOnce({ data: mockEligibility });

      const result = await buyModule.checkEligibility(request);

      expect(result.eligible).toBe(true);
      expect(result.paymentReady).toBe(true);
    });
  });

  describe('getOrder', () => {
    it('should get buy order by ID', async () => {
      const orderId = 'order-123';
      const mockOrder: Order = {
        id: orderId,
        externalCustomerId: 'user-123',
        orderType: 'BUY',
        fiat: 'USD',
        fiatAmount: '100',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        paymentMethodId: 1,
        paymentMethodType: 'card',
        status: 'complete',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: mockOrder });

      const result = await buyModule.getOrder(orderId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/buy/${orderId}`);
      expect(result).toEqual(mockOrder);
      expect(result.id).toBe(orderId);
    });
  });

  describe('getOrdersByAccount', () => {
    it('should get buy orders by externalCustomerId', async () => {
      const externalCustomerId = 'user-123';
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          externalCustomerId,
          orderType: 'BUY',
          fiat: 'USD',
          fiatAmount: '100',
          crypto: 'BTC',
          cryptoAmount: '0.001',
          walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          paymentMethodId: 1,
          paymentMethodType: 'card',
          status: 'complete',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: mockOrders });

      const result = await buyModule.getOrdersByAccount(externalCustomerId);

      expect(mockApiClient.get).toHaveBeenCalledWith('/buy', {
        externalCustomerId,
        per_page: 50,
        page: 1,
      });
      expect(result).toEqual(mockOrders);
    });

    it('should use custom pagination parameters', async () => {
      const externalCustomerId = 'user-123';
      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: [] });

      await buyModule.getOrdersByAccount(externalCustomerId, 20, 2);

      expect(mockApiClient.get).toHaveBeenCalledWith('/buy', {
        externalCustomerId,
        per_page: 20,
        page: 2,
      });
    });
  });

  describe('initializeCheckoutWebView', () => {
    it('should initialize WebView props from order with checkoutUrl', () => {
      const order: Order = {
        id: 'order-123',
        externalCustomerId: 'user-123',
        orderType: 'BUY',
        fiat: 'USD',
        fiatAmount: '100',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        paymentMethodId: 1,
        paymentMethodType: 'card',
        status: 'pendingPayment',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        checkoutUrl: 'https://checkout.banxa.com/order-123',
      };

      const props = buyModule.initializeCheckoutWebView(order, {
        onClose: jest.fn(),
        onSuccess: jest.fn(),
      });

      expect(props.checkoutUrl).toBe('https://checkout.banxa.com/order-123');
      expect(props.visible).toBe(true);
      expect(props.onClose).toBeDefined();
      expect(props.onSuccess).toBeDefined();
    });

    it('should throw error if order has no checkoutUrl', () => {
      const order: Order = {
        id: 'order-123',
        externalCustomerId: 'user-123',
        orderType: 'BUY',
        fiat: 'USD',
        fiatAmount: '100',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        paymentMethodId: 1,
        paymentMethodType: 'card',
        status: 'complete',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(() => buyModule.initializeCheckoutWebView(order)).toThrow(
        'Order does not have a checkout URL'
      );
    });
  });

  describe('createOrderAndShowPrimerCheckout', () => {
    it('should create buy order and show Primer checkout with nativeToken', async () => {
      const { Primer } = require('@primer-io/react-native');
      const request: CreateBuyOrderRequest = {
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://app.com/return',
      };

      const mockOrder: Order = {
        id: 'order-123',
        externalCustomerId: 'user-123',
        orderType: 'BUY',
        fiat: 'USD',
        fiatAmount: '100',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        paymentMethodId: 1,
        paymentMethodType: 'card',
        status: 'pendingPayment',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        checkoutUrl: 'https://checkout.banxa.com/order-123',
        nativeToken: 'primer-client-token-xyz',
      };

      mockApiClient.post = jest.fn().mockResolvedValueOnce({ data: mockOrder });

      const result = await buyModule.createOrderAndShowPrimerCheckout(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/buy', request);
      expect(result).toEqual(mockOrder);
      expect(Primer.showPaymentMethod).toHaveBeenCalledWith(
        'PAYMENT_CARD',
        'CHECKOUT',
        'primer-client-token-xyz'
      );
    });

    it('should use full Universal Checkout when paymentMethod is universal', async () => {
      const { Primer } = require('@primer-io/react-native');
      jest.clearAllMocks();
      const request: CreateBuyOrderRequest = {
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        fiatAmount: '100',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://app.com/return',
      };

      const mockOrder: Order = {
        id: 'order-456',
        nativeToken: 'primer-token-universal',
        checkoutUrl: 'https://checkout.banxa.com/order-456',
      } as Order;

      mockApiClient.post = jest.fn().mockResolvedValueOnce({ data: mockOrder });

      await buyModule.createOrderAndShowPrimerCheckout(request, {
        paymentMethod: 'universal',
      });

      expect(Primer.configure).toHaveBeenCalled();
      expect(Primer.showUniversalCheckout).toHaveBeenCalledWith('primer-token-universal');
      expect(Primer.showPaymentMethod).not.toHaveBeenCalled();
    });

    it('should return CheckoutWebView props when order has checkoutUrl but no nativeToken', async () => {
      const request: CreateBuyOrderRequest = {
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        walletAddress: '',
        redirectUrl: 'https://app.com/return',
      };

      const mockOrderWithoutToken: Order = {
        id: 'order-789',
        externalCustomerId: 'user-123',
        orderType: 'BUY',
        fiat: 'USD',
        fiatAmount: '100',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        paymentMethodId: 1,
        paymentMethodType: 'card',
        status: 'pendingPayment',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        checkoutUrl: 'https://checkout.banxa.com/order-789',
      };

      mockApiClient.post = jest
        .fn()
        .mockResolvedValueOnce({ data: mockOrderWithoutToken });

      const result = await buyModule.createOrderAndShowPrimerCheckout(request, {
        webViewProps: {
          returnUrlOnSuccess: 'https://app.com/ok',
          onClose: jest.fn(),
        },
      });

      expect('webViewProps' in result).toBe(true);
      if ('webViewProps' in result) {
        expect(result.order).toEqual(mockOrderWithoutToken);
        expect(result.webViewProps.checkoutUrl).toBe('https://checkout.banxa.com/order-789');
        expect(result.webViewProps.visible).toBe(true);
        expect(result.webViewProps.returnUrlOnSuccess).toBe('https://app.com/ok');
      }
    });

    it('should throw when order has neither nativeToken nor checkoutUrl', async () => {
      const request: CreateBuyOrderRequest = {
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        walletAddress: '',
        redirectUrl: 'https://app.com/return',
      };

      const mockOrderBroken: Order = {
        id: 'order-bad',
        orderType: 'BUY',
        status: 'pendingPayment',
      };

      mockApiClient.post = jest.fn().mockResolvedValueOnce({ data: mockOrderBroken });

      await expect(buyModule.createOrderAndShowPrimerCheckout(request)).rejects.toThrow(
        'no nativeToken and no checkoutUrl'
      );
    });
  });
});
