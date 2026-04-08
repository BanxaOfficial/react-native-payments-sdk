import { BanxaConfig } from '../types';
export declare class ApiClient {
    private apiKey;
    private partner;
    private baseUrl;
    constructor(config: BanxaConfig);
    private request;
    get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T>;
    post<T>(endpoint: string, body?: any): Promise<T>;
    put<T>(endpoint: string, body?: any): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}
