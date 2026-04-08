import { BanxaError } from './types';

export interface BanxaSDKErrorOptions {
  cause?: unknown;
  details?: Record<string, unknown>;
}

export class BanxaSDKError extends Error implements BanxaError {
  public code?: string;
  public statusCode?: number;
  public cause?: unknown;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    options?: BanxaSDKErrorOptions
  ) {
    super(message);
    this.name = 'BanxaSDKError';
    this.code = code;
    this.statusCode = statusCode;
    this.cause = options?.cause;
    this.details = options?.details;
    Object.setPrototypeOf(this, BanxaSDKError.prototype);
  }
}



