import { describe, test, expect } from 'vitest';
import { normalizeCoordinates, denormalizeCoordinates, normalizeAllFields } from '../utils/coordinateNormalizer';

describe('Coordinate Normalizer', () => {
  const pageDimensions = { width: 800, height: 1000 };

  describe('normalizeCoordinates', () => {
    test('should normalize coordinates correctly', () => {
      const field = {
        type: 'signature',
        page: 0,
        x: 200,
        y: 500,
        width: 160,
        height: 100
      };

      const result = normalizeCoordinates(field, pageDimensions);

      expect(result.xNorm).toBe(0.25);
      expect(result.yNormTop).toBe(0.5);
      expect(result.wNorm).toBe(0.2);
      expect(result.hNorm).toBe(0.1);
      expect(result.type).toBe('signature');
      expect(result.page).toBe(0);
    });

    test('should handle top-left corner', () => {
      const field = {
        type: 'text',
        x: 0,
        y: 0,
        width: 100,
        height: 50
      };

      const result = normalizeCoordinates(field, pageDimensions);

      expect(result.xNorm).toBe(0);
      expect(result.yNormTop).toBe(0);
      expect(result.wNorm).toBe(0.125);
      expect(result.hNorm).toBe(0.05);
    });

    test('should handle bottom-right corner', () => {
      const field = {
        type: 'date',
        x: 700,
        y: 950,
        width: 100,
        height: 50
      };

      const result = normalizeCoordinates(field, pageDimensions);

      expect(result.xNorm).toBe(0.875);
      expect(result.yNormTop).toBe(0.95);
      expect(result.wNorm).toBe(0.125);
      expect(result.hNorm).toBe(0.05);
    });

    test('should throw error for missing field', () => {
      expect(() => normalizeCoordinates(null, pageDimensions)).toThrow();
    });

    test('should throw error for missing dimensions', () => {
      const field = { x: 100, y: 100, width: 50, height: 50 };
      expect(() => normalizeCoordinates(field, null)).toThrow();
    });
  });

  describe('denormalizeCoordinates', () => {
    test('should denormalize coordinates correctly', () => {
      const normalizedField = {
        xNorm: 0.25,
        yNormTop: 0.5,
        wNorm: 0.2,
        hNorm: 0.1
      };

      const result = denormalizeCoordinates(normalizedField, pageDimensions);

      expect(result.x).toBe(200);
      expect(result.y).toBe(500);
      expect(result.width).toBe(160);
      expect(result.height).toBe(100);
    });
  });

  describe('normalizeAllFields', () => {
    test('should normalize multiple fields', () => {
      const fields = [
        { type: 'signature', x: 100, y: 200, width: 150, height: 60 },
        { type: 'text', x: 300, y: 400, width: 200, height: 40 }
      ];

      const result = normalizeAllFields(fields, pageDimensions);

      expect(result).toHaveLength(2);
      expect(result[0].xNorm).toBe(0.125);
      expect(result[1].xNorm).toBe(0.375);
    });
  });
});
