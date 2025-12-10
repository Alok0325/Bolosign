import AuditLoggerService from '../services/AuditLoggerService.js';
import { AuditLog } from '../models/index.js';
import { connectDB, disconnectDB } from '../utils/database.js';

describe('Audit Log Service Tests', () => {
  beforeAll(async () => {
    if (process.env.MONGODB_URI) {
      await connectDB();
    }
  });

  afterAll(async () => {
    if (process.env.MONGODB_URI) {
      await disconnectDB();
    }
  });

  test('should create audit entry with valid data', async () => {
    if (!process.env.MONGODB_URI) {
      console.log('MongoDB not configured, skipping audit log test');
      return;
    }

    const testPdfId = 'test-audit-' + Date.now();
    const testFields = [
      {
        type: 'signature',
        page: 0,
        xNorm: 0.5,
        yNormTop: 0.5,
        wNorm: 0.2,
        hNorm: 0.1
      }
    ];

    const auditLog = await AuditLoggerService.createAuditEntry(
      testPdfId,
      'original-hash-123',
      'signed-hash-456',
      './uploads/test-signed.pdf',
      testFields
    );

    expect(auditLog).toBeDefined();
    expect(auditLog.pdfId).toBe(testPdfId);
    expect(auditLog.originalHash).toBe('original-hash-123');
    expect(auditLog.signedHash).toBe('signed-hash-456');
    expect(auditLog.fields).toHaveLength(1);

    await AuditLog.deleteOne({ pdfId: testPdfId });
  });

  test('should retrieve audit logs by pdfId', async () => {
    if (!process.env.MONGODB_URI) {
      console.log('MongoDB not configured, skipping audit log retrieval test');
      return;
    }

    const testPdfId = 'test-retrieve-' + Date.now();

    await AuditLoggerService.createAuditEntry(
      testPdfId,
      'hash1',
      'hash2',
      './uploads/test.pdf',
      []
    );

    const logs = await AuditLoggerService.getAuditLogs(testPdfId);

    expect(logs).toBeDefined();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].pdfId).toBe(testPdfId);

    await AuditLog.deleteOne({ pdfId: testPdfId });
  });
});
