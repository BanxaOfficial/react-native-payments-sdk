"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanxaSDKError = void 0;
class BanxaSDKError extends Error {
    constructor(message, code, statusCode, options) {
        super(message);
        this.name = 'BanxaSDKError';
        this.code = code;
        this.statusCode = statusCode;
        this.cause = options?.cause;
        this.details = options?.details;
        Object.setPrototypeOf(this, BanxaSDKError.prototype);
    }
}
exports.BanxaSDKError = BanxaSDKError;
