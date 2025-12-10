describe('Payload Validation Tests', () => {
  const validateCoordinates = (field) => {
    return (
      field.xNorm >= 0 && field.xNorm <= 1 &&
      field.yNormTop >= 0 && field.yNormTop <= 1 &&
      field.wNorm >= 0 && field.wNorm <= 1 &&
      field.hNorm >= 0 && field.hNorm <= 1
    );
  };

  test('should validate correct normalized coordinates', () => {
    const validField = {
      type: 'signature',
      page: 0,
      xNorm: 0.5,
      yNormTop: 0.5,
      wNorm: 0.2,
      hNorm: 0.1
    };

    expect(validateCoordinates(validField)).toBe(true);
  });

  test('should reject coordinates below 0', () => {
    const invalidField = {
      xNorm: -0.1,
      yNormTop: 0.5,
      wNorm: 0.2,
      hNorm: 0.1
    };

    expect(validateCoordinates(invalidField)).toBe(false);
  });

  test('should reject coordinates above 1', () => {
    const invalidField = {
      xNorm: 0.5,
      yNormTop: 1.5,
      wNorm: 0.2,
      hNorm: 0.1
    };

    expect(validateCoordinates(invalidField)).toBe(false);
  });

  test('should accept boundary values 0 and 1', () => {
    const boundaryField = {
      xNorm: 0,
      yNormTop: 1,
      wNorm: 1,
      hNorm: 0
    };

    expect(validateCoordinates(boundaryField)).toBe(true);
  });

  test('should validate multiple fields', () => {
    const fields = [
      { xNorm: 0.1, yNormTop: 0.2, wNorm: 0.3, hNorm: 0.4 },
      { xNorm: 0.5, yNormTop: 0.6, wNorm: 0.7, hNorm: 0.8 },
      { xNorm: 0.9, yNormTop: 0.1, wNorm: 0.05, hNorm: 0.05 }
    ];

    const allValid = fields.every(validateCoordinates);
    expect(allValid).toBe(true);
  });
});
