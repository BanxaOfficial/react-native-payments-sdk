"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostedKycWebView = exports.CheckoutWebView = exports.KycModule = exports.CustomerIdentityModule = exports.CurrenciesModule = exports.CountriesModule = exports.PaymentMethodsModule = exports.PricesModule = exports.SellModule = exports.BuyModule = exports.BanxaSDKError = exports.Banxa = void 0;
var banxa_1 = require("./banxa");
Object.defineProperty(exports, "Banxa", { enumerable: true, get: function () { return banxa_1.Banxa; } });
__exportStar(require("./types"), exports);
var errors_1 = require("./errors");
Object.defineProperty(exports, "BanxaSDKError", { enumerable: true, get: function () { return errors_1.BanxaSDKError; } });
// Re-export modules for advanced usage
var buy_1 = require("./modules/buy");
Object.defineProperty(exports, "BuyModule", { enumerable: true, get: function () { return buy_1.BuyModule; } });
var sell_1 = require("./modules/sell");
Object.defineProperty(exports, "SellModule", { enumerable: true, get: function () { return sell_1.SellModule; } });
var prices_1 = require("./modules/prices");
Object.defineProperty(exports, "PricesModule", { enumerable: true, get: function () { return prices_1.PricesModule; } });
var paymentMethods_1 = require("./modules/paymentMethods");
Object.defineProperty(exports, "PaymentMethodsModule", { enumerable: true, get: function () { return paymentMethods_1.PaymentMethodsModule; } });
var countries_1 = require("./modules/countries");
Object.defineProperty(exports, "CountriesModule", { enumerable: true, get: function () { return countries_1.CountriesModule; } });
var currencies_1 = require("./modules/currencies");
Object.defineProperty(exports, "CurrenciesModule", { enumerable: true, get: function () { return currencies_1.CurrenciesModule; } });
var customerIdentity_1 = require("./modules/customerIdentity");
Object.defineProperty(exports, "CustomerIdentityModule", { enumerable: true, get: function () { return customerIdentity_1.CustomerIdentityModule; } });
var kyc_1 = require("./modules/kyc");
Object.defineProperty(exports, "KycModule", { enumerable: true, get: function () { return kyc_1.KycModule; } });
// Re-export components
var CheckoutWebView_1 = require("./components/CheckoutWebView");
Object.defineProperty(exports, "CheckoutWebView", { enumerable: true, get: function () { return CheckoutWebView_1.CheckoutWebView; } });
var HostedKycWebView_1 = require("./components/HostedKycWebView");
Object.defineProperty(exports, "HostedKycWebView", { enumerable: true, get: function () { return HostedKycWebView_1.HostedKycWebView; } });
