"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrimerCheckoutWebViewResult = isPrimerCheckoutWebViewResult;
/** Narrow `createOrderAndShowPrimerCheckout` / eligibility results to the WebView branch. */
function isPrimerCheckoutWebViewResult(value) {
    return value != null && typeof value === 'object' && 'webViewProps' in value;
}
