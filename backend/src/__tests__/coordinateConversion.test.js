import PDFGeneratorService from '../services/PDFGeneratorService.js';

describe('Coordinate Conversion Tests', () => {
  const mockPage = {
    getSize: () => ({ width: 800, height: 1000 })
  };

  test('should convert normalized coordinates to PDF points correctly', () => {
    const normalizedField = {
      xNorm: 0.25,
      yNormTop: 0.5,
      wNorm: 0.2,
      hNorm: 0.1
    };

    const result = PDFGeneratorService.convertCoordinates(normalizedField, mockPage);

    expect(result.xPt).toBe(200);
    expect(result.wPt).toBe(160);
    expect(result.hPt).toBe(100);
    expect(result.yPt).toBe(400);
  });

  test('should handle top-left corner field', () => {
    const normalizedField = {
      xNorm: 0,
      yNormTop: 0,
      wNorm: 0.125,
      hNorm: 0.05
    };

    const result = PDFGeneratorService.convertCoordinates(normalizedField, mockPage);

    expect(result.xPt).toBe(0);
    expect(result.yPt).toBe(950);
    expect(result.wPt).toBe(100);
    expect(result.hPt).toBe(50);
  });

  test('should handle center field', () => {
    const normalizedField = {
      xNorm: 0.4375,
      yNormTop: 0.475,
      wNorm: 0.125,
      hNorm: 0.05
    };

    const result = PDFGeneratorService.convertCoordinates(normalizedField, mockPage);

    expect(result.xPt).toBe(350);
    expect(result.yPt).toBe(475);
    expect(result.wPt).toBe(100);
    expect(result.hPt).toBe(50);
  });

  test('should handle bottom-right corner field', () => {
    const normalizedField = {
      xNorm: 0.875,
      yNormTop: 0.95,
      wNorm: 0.125,
      hNorm: 0.05
    };

    const result = PDFGeneratorService.convertCoordinates(normalizedField, mockPage);

    expect(result.xPt).toBe(700);
    expect(result.yPt).toBe(0);
    expect(result.wPt).toBe(100);
    expect(result.hPt).toBe(50);
  });
});
