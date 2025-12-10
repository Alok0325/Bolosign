import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib';
import fs from 'fs';

class PDFGeneratorService {
  convertCoordinates(normalizedField, pdfPage) {
    const { width: pdfWidth, height: pdfHeight } = pdfPage.getSize();
    
    const xPt = normalizedField.xNorm * pdfWidth;
    const wPt = normalizedField.wNorm * pdfWidth;
    const hPt = normalizedField.hNorm * pdfHeight;
    
    const yPt = pdfHeight - (normalizedField.yNormTop * pdfHeight) - hPt;
    
    return { xPt, yPt, wPt, hPt };
  }

  async generateSignedPDF(originalPdfPath, signatureImage, fields) {
    try {
      const existingPdfBytes = fs.readFileSync(originalPdfPath);
      const pdfDoc = await PDFLibDocument.load(existingPdfBytes);
      
      // No longer need to embed a global signature image
      // Each signature field will embed its own image individually

      // Embed font for text fields
      const { StandardFonts } = await import('pdf-lib');
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const field of fields) {
        const pageIndex = field.page || 0;
        const page = pdfDoc.getPages()[pageIndex];
        
        if (!page) {
          throw new Error(`Page ${pageIndex} does not exist in the PDF`);
        }

        const { xPt, yPt, wPt, hPt } = this.convertCoordinates(field, page);
        
        if (field.type === 'signature') {
          // Use only the field-specific signature image
          if (field.value) {
            try {
              // Embed each signature image individually
              const base64Data = field.value.replace(/^data:image\/\w+;base64,/, '');
              const imageBytes = Buffer.from(base64Data, 'base64');
              
              let fieldSignatureImage;
              try {
                fieldSignatureImage = await pdfDoc.embedPng(imageBytes);
              } catch (pngError) {
                fieldSignatureImage = await pdfDoc.embedJpg(imageBytes);
              }
              
              const imageAspectRatio = fieldSignatureImage.width / fieldSignatureImage.height;
              const fieldAspectRatio = wPt / hPt;
              
              let drawWidth = wPt;
              let drawHeight = hPt;
              let xOffset = 0;
              let yOffset = 0;
              
              if (imageAspectRatio > fieldAspectRatio) {
                drawHeight = wPt / imageAspectRatio;
                yOffset = (hPt - drawHeight) / 2;
              } else {
                drawWidth = hPt * imageAspectRatio;
                xOffset = (wPt - drawWidth) / 2;
              }
              
              page.drawImage(fieldSignatureImage, {
                x: xPt + xOffset,
                y: yPt + yOffset,
                width: drawWidth,
                height: drawHeight
              });
            } catch (signatureError) {
              console.error('Error embedding signature image:', signatureError);
              // Draw placeholder rectangle if signature fails
              page.drawRectangle({
                x: xPt,
                y: yPt,
                width: wPt,
                height: hPt,
                borderColor: rgb(0.8, 0.8, 0.8),
                borderWidth: 1
              });
            }
          }
        } else if (field.type === 'image') {
          // Handle uploaded images
          if (field.value) {
            try {
              const base64Data = field.value.replace(/^data:image\/\w+;base64,/, '');
              const imageBytes = Buffer.from(base64Data, 'base64');
              
              let fieldImage;
              try {
                fieldImage = await pdfDoc.embedPng(imageBytes);
              } catch (pngError) {
                fieldImage = await pdfDoc.embedJpg(imageBytes);
              }
              
              const imageAspectRatio = fieldImage.width / fieldImage.height;
              const fieldAspectRatio = wPt / hPt;
              
              let drawWidth = wPt;
              let drawHeight = hPt;
              let xOffset = 0;
              let yOffset = 0;
              
              if (imageAspectRatio > fieldAspectRatio) {
                drawHeight = wPt / imageAspectRatio;
                yOffset = (hPt - drawHeight) / 2;
              } else {
                drawWidth = hPt * imageAspectRatio;
                xOffset = (wPt - drawWidth) / 2;
              }
              
              page.drawImage(fieldImage, {
                x: xPt + xOffset,
                y: yPt + yOffset,
                width: drawWidth,
                height: drawHeight
              });
            } catch (imageError) {
              console.error('Error embedding field image:', imageError);
              // Draw placeholder rectangle if image fails
              page.drawRectangle({
                x: xPt,
                y: yPt,
                width: wPt,
                height: hPt,
                borderColor: rgb(0.8, 0.8, 0.8),
                borderWidth: 1
              });
            }
          }
        } else if (field.type === 'text' || field.type === 'date') {
          // Draw background rectangle
          page.drawRectangle({
            x: xPt,
            y: yPt,
            width: wPt,
            height: hPt,
            color: rgb(1, 1, 1),
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 1
          });
          
          // Draw text if value exists
          if (field.value && field.value.trim()) {
            const fontSize = Math.min(hPt * 0.6, 12); // Responsive font size
            const textWidth = font.widthOfTextAtSize(field.value, fontSize);
            
            // Center text in field
            const textX = xPt + (wPt - textWidth) / 2;
            const textY = yPt + (hPt - fontSize) / 2;
            
            page.drawText(field.value, {
              x: Math.max(xPt + 2, textX), // Add small padding
              y: textY,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0)
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }
}

export default new PDFGeneratorService();
