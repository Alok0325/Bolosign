import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.TEST_API_URL || 'http://localhost:5000';

describe('PDF API Integration Tests', () => {
  let testPdfId;
  let testOriginalHash;

  describe('POST /api/pdf/upload', () => {
    test('should upload a valid PDF file', async () => {
      const testPdfPath = path.join(__dirname, 'fixtures', 'test.pdf');
      
      if (!fs.existsSync(testPdfPath)) {
        console.log('Test PDF not found, skipping upload test');
        return;
      }

      const response = await request(API_URL)
        .post('/api/pdf/upload')
        .attach('pdf', testPdfPath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pdfId).toBeDefined();
      expect(response.body.originalHash).toBeDefined();
      expect(response.body.originalHash).toHaveLength(64);

      testPdfId = response.body.pdfId;
      testOriginalHash = response.body.originalHash;
    });

    test('should reject non-PDF files', async () => {
      const testFilePath = path.join(__dirname, 'fixtures', 'test.txt');
      
      if (!fs.existsSync(testFilePath)) {
        console.log('Test file not found, skipping rejection test');
        return;
      }

      const response = await request(API_URL)
        .post('/api/pdf/upload')
        .attach('pdf', testFilePath)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    test('should reject request without file', async () => {
      const response = await request(API_URL)
        .post('/api/pdf/upload')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_FILE');
    });
  });

  describe('POST /api/pdf/sign', () => {
    test('should reject request with missing fields', async () => {
      const response = await request(API_URL)
        .post('/api/pdf/sign')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PAYLOAD');
    });

    test('should reject request with invalid coordinates', async () => {
      const response = await request(API_URL)
        .post('/api/pdf/sign')
        .send({
          pdfId: 'test-id',
          signatureImage: 'data:image/png;base64,test',
          fields: [{
            type: 'signature',
            page: 0,
            xNorm: 1.5,
            yNormTop: 0.5,
            wNorm: 0.2,
            hNorm: 0.1
          }]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_COORDINATES');
    });

    test('should reject request with non-existent PDF', async () => {
      const response = await request(API_URL)
        .post('/api/pdf/sign')
        .send({
          pdfId: 'non-existent-id',
          signatureImage: 'data:image/png;base64,test',
          fields: [{
            type: 'signature',
            page: 0,
            xNorm: 0.5,
            yNormTop: 0.5,
            wNorm: 0.2,
            hNorm: 0.1
          }]
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PDF_NOT_FOUND');
    });
  });

  describe('GET /api/pdf/download/:pdfId', () => {
    test('should return 404 for non-existent PDF', async () => {
      const response = await request(API_URL)
        .get('/api/pdf/download/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FILE_NOT_FOUND');
    });
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await request(API_URL)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });
});
