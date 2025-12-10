import AuditLoggerService from '../services/AuditLoggerService.js';
import crypto from 'crypto';

describe('SHA-256 Hash Computation Tests', () => {
  test('should compute consistent hash for same buffer', () => {
    const testData = Buffer.from('test data for hashing');
    
    const hash1 = AuditLoggerService.computeHash(testData);
    const hash2 = AuditLoggerService.computeHash(testData);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  test('should compute different hashes for different data', () => {
    const data1 = Buffer.from('test data 1');
    const data2 = Buffer.from('test data 2');

    const hash1 = AuditLoggerService.computeHash(data1);
    const hash2 = AuditLoggerService.computeHash(data2);

    expect(hash1).not.toBe(hash2);
  });

  test('should compute hash for string data', () => {
    const testString = 'test string data';
    
    const hash = AuditLoggerService.computeHash(testString);
    const expectedHash = crypto.createHash('sha256').update(testString).digest('hex');

    expect(hash).toBe(expectedHash);
    expect(hash).toHaveLength(64);
  });

  test('should produce valid SHA-256 hex format', () => {
    const testData = Buffer.from('validation test');
    const hash = AuditLoggerService.computeHash(testData);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should handle empty buffer', () => {
    const emptyBuffer = Buffer.from('');
    const hash = AuditLoggerService.computeHash(emptyBuffer);

    expect(hash).toHaveLength(64);
    expect(hash).toBe(crypto.createHash('sha256').update(emptyBuffer).digest('hex'));
  });
});
