import { describe, test, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { uploadPDF, submitSignedPDF, getDownloadUrl } from '../services/api';

vi.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadPDF', () => {
    test('should upload PDF successfully', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        data: {
          success: true,
          pdfId: 'test-id-123',
          originalHash: 'abc123hash'
        }
      };

      axios.create = vi.fn(() => ({
        post: vi.fn().mockResolvedValue(mockResponse)
      }));

      const result = await uploadPDF(mockFile);

      expect(result.success).toBe(true);
      expect(result.pdfId).toBe('test-id-123');
    });
  });

  describe('submitSignedPDF', () => {
    test('should submit signed PDF successfully', async () => {
      const mockPayload = {
        pdfId: 'test-id',
        signatureImage: 'data:image/png;base64,test',
        fields: []
      };

      const mockResponse = {
        data: {
          success: true,
          signedPdfUrl: '/api/pdf/download/test-id',
          originalHash: 'hash1',
          signedHash: 'hash2'
        }
      };

      axios.create = vi.fn(() => ({
        post: vi.fn().mockResolvedValue(mockResponse)
      }));

      const result = await submitSignedPDF(mockPayload);

      expect(result.success).toBe(true);
      expect(result.signedPdfUrl).toBeDefined();
    });
  });

  describe('getDownloadUrl', () => {
    test('should generate correct download URL', () => {
      const pdfId = 'test-id-123';
      const url = getDownloadUrl(pdfId);

      expect(url).toContain('/api/pdf/download/test-id-123');
    });
  });
});
