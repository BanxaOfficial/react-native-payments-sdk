"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const errors_1 = require("../errors");
class ApiClient {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.partner = config.partner;
        if (config.baseUrl) {
            this.baseUrl = config.baseUrl;
        }
        else {
            const env = config.environment || 'production';
            switch (env) {
                case 'local':
                    this.baseUrl = `https://papi.test/${config.partner}/v2`;
                    break;
                case 'sandbox':
                    this.baseUrl = `https://api.banxa-sandbox.com/${config.partner}/v2`;
                    break;
                case 'preprod':
                    this.baseUrl = `https://api.banxa-preprod.com/${config.partner}/v2`;
                    break;
                case 'production':
                    this.baseUrl = `https://api.banxa.com/${config.partner}/v2`;
                    break;
                default:
                    throw new Error(`Invalid environment: ${env}`);
            }
            ;
        }
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            ...(options.headers && typeof options.headers === 'object' && !('append' in options.headers)
                ? options.headers
                : {}),
        };
        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const baseMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
                const message = response.status === 404 ? `${baseMessage} — ${url}` : baseMessage;
                throw new errors_1.BanxaSDKError(message, errorData?.code, response.status, {
                    details: errorData && Object.keys(errorData).length > 0 ? errorData : undefined,
                });
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            if (error instanceof errors_1.BanxaSDKError) {
                throw error;
            }
            const message = error instanceof Error ? error.message : String(error);
            throw new errors_1.BanxaSDKError(message, 'NETWORK_ERROR', undefined, { cause: error });
        }
    }
    async get(endpoint, params) {
        let url = endpoint;
        if (params) {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });
            const queryString = queryParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        return this.request(url, { method: 'GET' });
    }
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
exports.ApiClient = ApiClient;
