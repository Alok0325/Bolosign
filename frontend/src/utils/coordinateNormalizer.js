export const normalizeCoordinates = (field, pageDimensions) => {
  if (!field || !pageDimensions) {
    throw new Error('Field and page dimensions are required');
  }

  const { width: pageWidth, height: pageHeight } = pageDimensions;

  if (pageWidth <= 0 || pageHeight <= 0) {
    throw new Error('Invalid page dimensions');
  }

  const xNorm = field.x / pageWidth;
  const yNormTop = field.y / pageHeight;
  const wNorm = field.width / pageWidth;
  const hNorm = field.height / pageHeight;

  return {
    type: field.type,
    page: field.page || 0,
    xNorm,
    yNormTop,
    wNorm,
    hNorm
  };
};

export const denormalizeCoordinates = (normalizedField, pageDimensions) => {
  if (!normalizedField || !pageDimensions) {
    throw new Error('Normalized field and page dimensions are required');
  }

  const { width: pageWidth, height: pageHeight } = pageDimensions;

  return {
    x: normalizedField.xNorm * pageWidth,
    y: normalizedField.yNormTop * pageHeight,
    width: normalizedField.wNorm * pageWidth,
    height: normalizedField.hNorm * pageHeight
  };
};

export const normalizeAllFields = (fields, pageDimensions) => {
  return fields.map(field => normalizeCoordinates(field, pageDimensions));
};
