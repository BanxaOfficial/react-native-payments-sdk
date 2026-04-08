import { BanxaError } from './types';
export interface BanxaSDKErrorOptions {
    cause?: unknown;
    details?: Record<string, unknown>;
}
export declare class BanxaSDKError extends Error implements BanxaError {
    code?: string;
    statusCode?: number;
    cause?: unknown;
    details?: Record<string, unknown>;
    constructor(message: string, code?: string, statusCode?: number, options?: BanxaSDKErrorOptions);
}
