import { ApiClient } from './client/apiClient';
import { BanxaConfig } from './types';
import { BuyModule } from './modules/buy';
import { SellModule } from './modules/sell';
import { PricesModule } from './modules/prices';
import { PaymentMethodsModule } from './modules/paymentMethods';
import { CountriesModule } from './modules/countries';
import { CurrenciesModule } from './modules/currencies';
import { CustomerIdentityModule } from './modules/customerIdentity';
import { KycModule } from './modules/kyc';
import { PrimerCheckoutWrapper } from './primer/PrimerCheckoutWrapper';

function defaultPrimerCallbacks() {
  return {
    onCheckoutComplete: () => console.log('Payment completed successfully!'),
    onError: (error: { description?: string }) => console.log('Payment failed:', error.description ?? 'Unknown error'),
    onDismiss: () => console.log('Checkout dismissed'),
  };
}

export class Banxa {
  public buy: BuyModule;
  public sell: SellModule;
  public prices: PricesModule;
  public paymentMethods: PaymentMethodsModule;
  public countries: CountriesModule;
  public currencies: CurrenciesModule;
  public customerIdentity: CustomerIdentityModule;
  public kyc: KycModule;

  private client: ApiClient;

  constructor(config: BanxaConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    if (!config.partner) {
      throw new Error('Partner identifier is required');
    }

    this.client = new ApiClient(config);
    const primerCheckout = new PrimerCheckoutWrapper({
      callbacks: config.primerCallbacks ?? defaultPrimerCallbacks(),
      primerSettings: config.primerSettings,
    });
    this.buy = new BuyModule(this.client, { primerCheckout });
    this.sell = new SellModule(this.client, { primerCheckout });
    this.prices = new PricesModule(this.client);
    this.paymentMethods = new PaymentMethodsModule(this.client);
    this.countries = new CountriesModule(this.client);
    this.currencies = new CurrenciesModule(this.client);
    this.customerIdentity = new CustomerIdentityModule(this.client);
    this.kyc = new KycModule(this.client);
  }
}



