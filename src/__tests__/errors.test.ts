import { BanxaSDKError } from '../errors';

describe('BanxaSDKError', () => {
  describe('constructor', () => {
    it('should create error with message', () => {
      const error = new BanxaSDKError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BanxaSDKError);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('BanxaSDKError');
    });

    it('should create error with message and code', () => {
      const error = new BanxaSDKError('Test error', 'ERROR_CODE');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('ERROR_CODE');
    });

    it('should create error with message, code, and statusCode', () => {
      const error = new BanxaSDKError('Test error', 'ERROR_CODE', 400);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('ERROR_CODE');
      expect(error.statusCode).toBe(400);
    });

    it('should maintain prototype chain', () => {
      const error = new BanxaSDKError('Test error');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof BanxaSDKError).toBe(true);
    });
  });

  describe('error properties', () => {
    it('should have all properties accessible', () => {
      const error = new BanxaSDKError('Network error', 'NETWORK_ERROR', 500);

      expect(error.message).toBe('Network error');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should allow optional code and statusCode', () => {
      const error = new BanxaSDKError('Simple error');

      expect(error.message).toBe('Simple error');
      expect(error.code).toBeUndefined();
      expect(error.statusCode).toBeUndefined();
    });

    it('should preserve cause and details', () => {
      const original = new Error('Network failed');
      const details = { errors: ['field is invalid'] };
      const error = new BanxaSDKError('Request failed', 'NETWORK_ERROR', undefined, {
        cause: original,
        details,
      });

      expect(error.cause).toBe(original);
      expect(error.details).toEqual(details);
      expect(error.message).toBe('Request failed');
    });
  });
});



