import { Banxa } from '../banxa';
import { BanxaConfig } from '../types';
import { ApiClient } from '../client/apiClient';
import { BuyModule } from '../modules/buy';
import { SellModule } from '../modules/sell';
import { PricesModule } from '../modules/prices';
import { PaymentMethodsModule } from '../modules/paymentMethods';
import { CountriesModule } from '../modules/countries';
import { CurrenciesModule } from '../modules/currencies';
import { CustomerIdentityModule } from '../modules/customerIdentity';

jest.mock('../client/apiClient');

describe('Banxa', () => {
  const mockConfig: BanxaConfig = {
    apiKey: 'test-api-key',
    partner: 'test-partner',
    environment: 'production',
  };

  describe('constructor', () => {
    it('should initialize with all modules', () => {
      const banxa = new Banxa(mockConfig);

      expect(banxa.buy).toBeInstanceOf(BuyModule);
      expect(banxa.sell).toBeInstanceOf(SellModule);
      expect(banxa.prices).toBeInstanceOf(PricesModule);
      expect(banxa.paymentMethods).toBeInstanceOf(PaymentMethodsModule);
      expect(banxa.countries).toBeInstanceOf(CountriesModule);
      expect(banxa.currencies).toBeInstanceOf(CurrenciesModule);
      expect(banxa.customerIdentity).toBeInstanceOf(CustomerIdentityModule);
    });

    it('should throw error if apiKey is missing', () => {
      const config = { ...mockConfig };
      delete (config as any).apiKey;

      expect(() => new Banxa(config as BanxaConfig)).toThrow('API key is required');
    });

    it('should throw error if partner is missing', () => {
      const config = { ...mockConfig };
      delete (config as any).partner;

      expect(() => new Banxa(config as BanxaConfig)).toThrow('Partner identifier is required');
    });

    it('should initialize with sandbox environment', () => {
      const sandboxConfig = { ...mockConfig, environment: 'sandbox' as const };
      const banxa = new Banxa(sandboxConfig);

      expect(banxa.buy).toBeInstanceOf(BuyModule);
    });

    it('should initialize with custom baseUrl', () => {
      const customConfig = { ...mockConfig, baseUrl: 'https://custom.api.com/v2' };
      const banxa = new Banxa(customConfig);

      expect(banxa.buy).toBeInstanceOf(BuyModule);
    });
  });

  describe('module access', () => {
    let banxa: Banxa;

    beforeEach(() => {
      banxa = new Banxa(mockConfig);
    });

    it('should provide access to buy module', () => {
      expect(banxa.buy).toBeDefined();
      expect(typeof banxa.buy.createOrder).toBe('function');
      expect(typeof banxa.buy.getOrder).toBe('function');
      expect(typeof banxa.buy.getOrdersByAccount).toBe('function');
      expect(typeof banxa.buy.initializeCheckoutWebView).toBe('function');
      expect(typeof banxa.buy.checkEligibility).toBe('function');
    });

    it('should provide access to sell module', () => {
      expect(banxa.sell).toBeDefined();
      expect(typeof banxa.sell.createOrder).toBe('function');
      expect(typeof banxa.sell.getOrder).toBe('function');
      expect(typeof banxa.sell.getOrdersByAccount).toBe('function');
      expect(typeof banxa.sell.initializeCheckoutWebView).toBe('function');
      expect(typeof banxa.sell.checkEligibility).toBe('function');
    });

    it('should provide access to prices module', () => {
      expect(banxa.prices).toBeDefined();
      expect(typeof banxa.prices.getQuote).toBe('function');
      expect(typeof banxa.prices.getBuyQuote).toBe('function');
      expect(typeof banxa.prices.getSellQuote).toBe('function');
    });

    it('should provide access to paymentMethods module', () => {
      expect(banxa.paymentMethods).toBeDefined();
      expect(typeof banxa.paymentMethods.getPaymentMethods).toBe('function');
      expect(typeof banxa.paymentMethods.getPaymentMethod).toBe('function');
    });

    it('should provide access to countries module', () => {
      expect(banxa.countries).toBeDefined();
      expect(typeof banxa.countries.getCountries).toBe('function');
      expect(typeof banxa.countries.getCountry).toBe('function');
    });

    it('should provide access to currencies module', () => {
      expect(banxa.currencies).toBeDefined();
      expect(typeof banxa.currencies.getFiats).toBe('function');
      expect(typeof banxa.currencies.getCrypto).toBe('function');
      expect(typeof banxa.currencies.getFiatCurrencies).toBe('function');
      expect(typeof banxa.currencies.getCryptoCurrencies).toBe('function');
    });

    it('should provide access to customerIdentity module', () => {
      expect(banxa.customerIdentity).toBeDefined();
      expect(typeof banxa.customerIdentity.registerCustomerIdentity).toBe('function');
      expect(typeof banxa.customerIdentity.getCustomerIdentity).toBe('function');
    });
  });
});



