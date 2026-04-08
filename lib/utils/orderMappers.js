"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCreateOrderRequestToBuyBody = mapCreateOrderRequestToBuyBody;
exports.mapCreateOrderRequestToSellBody = mapCreateOrderRequestToSellBody;
/**
 * Banxa API expects camelCase and specific field names.
 * Buy: source = fiat, target = crypto → fiatAmount = source_amount, cryptoAmount = target_amount
 */
function mapCreateOrderRequestToBuyBody(req) {
    const redirectUrl = req.return_url_on_success ??
        req.return_url_on_failure ??
        req.return_url_on_cancelled ??
        '';
    const body = {
        externalCustomerId: req.account_reference,
        fiat: req.source,
        crypto: req.target,
        walletAddress: req.wallet_address ?? '',
        redirectUrl,
    };
    if (req.source_amount != null)
        body.fiatAmount = req.source_amount;
    if (req.target_amount != null)
        body.cryptoAmount = req.target_amount;
    if (req.wallet_address_tag != null)
        body.walletAddressTag = req.wallet_address_tag;
    if (req.payment_method_id != null)
        body.paymentMethodId = String(req.payment_method_id);
    if (req.blockchain != null)
        body.blockchain = req.blockchain;
    if (req.meta_data != null)
        body.metadata =
            typeof req.meta_data === 'string'
                ? req.meta_data
                : JSON.stringify(req.meta_data);
    return body;
}
/**
 * Sell: source = crypto, target = fiat → cryptoAmount = source_amount, fiatAmount = target_amount
 */
function mapCreateOrderRequestToSellBody(req) {
    const redirectUrl = req.return_url_on_success ??
        req.return_url_on_failure ??
        req.return_url_on_cancelled ??
        '';
    const body = {
        externalCustomerId: req.account_reference,
        fiat: req.target,
        crypto: req.source,
        walletAddress: req.wallet_address ?? '',
        redirectUrl,
    };
    if (req.source_amount != null)
        body.cryptoAmount = req.source_amount;
    if (req.target_amount != null)
        body.fiatAmount = req.target_amount;
    if (req.wallet_address_tag != null)
        body.walletAddressTag = req.wallet_address_tag;
    if (req.payment_method_id != null)
        body.paymentMethodId = String(req.payment_method_id);
    if (req.blockchain != null)
        body.blockchain = req.blockchain;
    if (req.meta_data != null)
        body.metadata =
            typeof req.meta_data === 'string'
                ? req.meta_data
                : JSON.stringify(req.meta_data);
    return body;
}
