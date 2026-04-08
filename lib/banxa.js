"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banxa = void 0;
const apiClient_1 = require("./client/apiClient");
const buy_1 = require("./modules/buy");
const sell_1 = require("./modules/sell");
const prices_1 = require("./modules/prices");
const paymentMethods_1 = require("./modules/paymentMethods");
const countries_1 = require("./modules/countries");
const currencies_1 = require("./modules/currencies");
const customerIdentity_1 = require("./modules/customerIdentity");
const PrimerCheckoutWrapper_1 = require("./primer/PrimerCheckoutWrapper");
function defaultPrimerCallbacks() {
    return {
        onCheckoutComplete: () => console.log('Payment completed successfully!'),
        onError: (error) => console.log('Payment failed:', error.description ?? 'Unknown error'),
        onDismiss: () => console.log('Checkout dismissed'),
    };
}
class Banxa {
    constructor(config) {
        if (!config.apiKey) {
            throw new Error('API key is required');
        }
        if (!config.partner) {
            throw new Error('Partner identifier is required');
        }
        this.client = new apiClient_1.ApiClient(config);
        const primerCheckout = new PrimerCheckoutWrapper_1.PrimerCheckoutWrapper({
            callbacks: config.primerCallbacks ?? defaultPrimerCallbacks(),
            primerSettings: config.primerSettings,
        });
        this.buy = new buy_1.BuyModule(this.client, { primerCheckout });
        this.sell = new sell_1.SellModule(this.client, { primerCheckout });
        this.prices = new prices_1.PricesModule(this.client);
        this.paymentMethods = new paymentMethods_1.PaymentMethodsModule(this.client);
        this.countries = new countries_1.CountriesModule(this.client);
        this.currencies = new currencies_1.CurrenciesModule(this.client);
        this.customerIdentity = new customerIdentity_1.CustomerIdentityModule(this.client);
    }
}
exports.Banxa = Banxa;
