import { SellModule } from '../modules/sell';
import { ApiClient } from '../client/apiClient';
import {
  CreateSellOrderRequest,
  Order,
  OrderEligibilityResponse,
  BanxaResponse,
} from '../types';
import { BanxaSDKError } from '../errors';

jest.mock('../client/apiClient');

describe('SellModule', () => {
  let sellModule: SellModule;
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = new ApiClient({
      apiKey: 'test-key',
      partner: 'test-partner',
    }) as jest.Mocked<ApiClient>;
    sellModule = new SellModule(mockApiClient);
  });

  describe('createOrder', () => {
    it('should create a sell order successfully', async () => {
      const request: CreateSellOrderRequest = {
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://app.com/return',
      };

      const mockOrder: Order = {
        id: 'order-456',
        externalCustomerId: 'user-123',
        orderType: 'SELL',
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
        checkoutUrl: 'https://checkout.banxa.com/order-456',
      };

      mockApiClient.post = jest.fn().mockResolvedValueOnce({ data: mockOrder });

      const result = await sellModule.createOrder(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/sell', request);
      expect(result).toEqual(mockOrder);
      expect(result.orderType).toBe('SELL');
    });

    it('should handle API errors', async () => {
      const request: CreateSellOrderRequest = {
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        walletAddress: '',
        redirectUrl: 'https://app.com/return',
      };

      mockApiClient.post = jest.fn().mockRejectedValueOnce(
        new BanxaSDKError('Invalid request', 'INVALID_REQUEST', 400)
      );

      await expect(sellModule.createOrder(request)).rejects.toThrow(BanxaSDKError);
    });
  });

  describe('checkEligibility', () => {
    it('should check sell eligibility', async () => {
      const request: CreateSellOrderRequest = {
        externalCustomerId: 'user-123',
        fiat: 'USD',
        crypto: 'BTC',
        cryptoAmount: '0.001',
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        redirectUrl: 'https://app.com/return',
      };

      const mockEligibility: OrderEligibilityResponse = {
        eligible: true,
      };

      mockApiClient.post = jest
        .fn()
        .mockResolvedValueOnce({ data: mockEligibility });

      const result = await sellModule.checkEligibility(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/eligibility', { ...request, orderTypeId: 'sell' });
      expect(result).toEqual(mockEligibility);
    });
  });

  describe('getOrder', () => {
    it('should get sell order by ID', async () => {
      const orderId = 'order-456';
      const mockOrder: Order = {
        id: orderId,
        externalCustomerId: 'user-123',
        orderType: 'SELL',
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

      const result = await sellModule.getOrder(orderId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/sell/${orderId}`);
      expect(result).toEqual(mockOrder);
      expect(result.id).toBe(orderId);
    });
  });

  describe('getOrdersByAccount', () => {
    it('should get sell orders by externalCustomerId', async () => {
      const externalCustomerId = 'user-123';
      const mockOrders: Order[] = [
        {
          id: 'order-2',
          externalCustomerId,
          orderType: 'SELL',
          fiat: 'USD',
          fiatAmount: '50',
          crypto: 'ETH',
          cryptoAmount: '0.02',
          walletAddress: '0x123',
          paymentMethodId: 1,
          paymentMethodType: 'card',
          status: 'complete',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get = jest.fn().mockResolvedValueOnce({ data: mockOrders });

      const result = await sellModule.getOrdersByAccount(externalCustomerId);

      expect(mockApiClient.get).toHaveBeenCalledWith('/sell', {
        externalCustomerId,
        per_page: 50,
        page: 1,
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('initializeCheckoutWebView', () => {
    it('should throw error if order has no checkoutUrl', () => {
      const order: Order = {
        id: 'order-456',
        externalCustomerId: 'user-123',
        orderType: 'SELL',
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

      expect(() => sellModule.initializeCheckoutWebView(order)).toThrow(
        'Order does not have a checkout URL'
      );
    });
  });
});
