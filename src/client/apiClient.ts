import { BanxaConfig } from '../types';
import { BanxaSDKError } from '../errors';

export class ApiClient {
  private apiKey: string;
  private partner: string;
  private baseUrl: string;

  constructor(config: BanxaConfig) {
    this.apiKey = config.apiKey;
    this.partner = config.partner;
    
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else {
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
      };
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...(options.headers && typeof options.headers === 'object' && !('append' in options.headers)
        ? options.headers
        : {}),
    } as Record<string, string>;

    console.log('headers', headers);
    console.log('url', url);
    console.log('options', options);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
        const baseMessage = (errorData?.message as string) || `HTTP ${response.status}: ${response.statusText}`;
        const message =
          response.status === 404 ? `${baseMessage} — ${url}` : baseMessage;
        throw new BanxaSDKError(message, errorData?.code as string | undefined, response.status, {
          details: errorData && Object.keys(errorData).length > 0 ? errorData : undefined,
        });
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof BanxaSDKError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      throw new BanxaSDKError(message, 'NETWORK_ERROR', undefined, { cause: error });
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
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
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

