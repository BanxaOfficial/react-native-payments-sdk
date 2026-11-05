import { BanxaConfig } from './types';
import { BuyModule } from './modules/buy';
import { SellModule } from './modules/sell';
import { PricesModule } from './modules/prices';
import { PaymentMethodsModule } from './modules/paymentMethods';
import { CountriesModule } from './modules/countries';
import { CurrenciesModule } from './modules/currencies';
import { CustomerIdentityModule } from './modules/customerIdentity';
import { KycModule } from './modules/kyc';
export declare class Banxa {
    buy: BuyModule;
    sell: SellModule;
    prices: PricesModule;
    paymentMethods: PaymentMethodsModule;
    countries: CountriesModule;
    currencies: CurrenciesModule;
    customerIdentity: CustomerIdentityModule;
    kyc: KycModule;
    private client;
    constructor(config: BanxaConfig);
}
