import { v4 as uuidv4 } from 'uuid';
import { PDFDocument } from '../models/index.js';
import { computeFileHash } from '../utils/hash.js';
import PDFGeneratorService from '../services/PDFGeneratorService.js';
import AuditLoggerService from '../services/AuditLoggerService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No PDF file uploaded'
        }
      });
    }

    const pdfId = uuidv4();
    const filePath = req.file.path;
    const originalFileName = req.file.originalname;

    const originalHash = await computeFileHash(filePath);

    const pdfDocument = new PDFDocument({
      pdfId,
      originalFileName,
      originalHash,
      filePath
    });

    await pdfDocument.save();

    res.status(200).json({
      success: true,
      pdfId,
      originalHash
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload PDF',
        details: error.message
      }
    });
  }
};

export const signPDF = async (req, res) => {
  try {
    const { pdfId, signatureImage, fields } = req.body;
    console.log('Received payload:', { pdfId, signatureImage, fieldsLength: fields?.length });

    if (!pdfId || !fields) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Missing required fields: pdfId or fields'
        }
      });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FIELDS',
          message: 'Fields must be a non-empty array'
        }
      });
    }

    for (const field of fields) {
      if (field.xNorm < 0 || field.xNorm > 1 || 
          field.yNormTop < 0 || field.yNormTop > 1 ||
          field.wNorm < 0 || field.wNorm > 1 ||
          field.hNorm < 0 || field.hNorm > 1) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COORDINATES',
            message: 'Field coordinates must be between 0 and 1',
            details: field
          }
        });
      }

      // Validate that signature and image fields have values
      if ((field.type === 'signature' || field.type === 'image') && !field.value) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELD_VALUE',
            message: `${field.type} field must have a value`,
            details: field
          }
        });
      }
    }

    const pdfDocument = await PDFDocument.findOne({ pdfId });
    
    if (!pdfDocument) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PDF_NOT_FOUND',
          message: 'PDF document not found'
        }
      });
    }

    if (!fs.existsSync(pdfDocument.filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'PDF file not found on server'
        }
      });
    }

    const signedPdfBuffer = await PDFGeneratorService.generateSignedPDF(
      pdfDocument.filePath,
      signatureImage,
      fields
    );

    const signedHash = AuditLoggerService.computeHash(signedPdfBuffer);

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const uploadsPath = path.resolve(__dirname, '../../', uploadDir);
    const signedFileName = `signed-${pdfId}.pdf`;
    const signedFilePath = path.join(uploadsPath, signedFileName);

    fs.writeFileSync(signedFilePath, signedPdfBuffer);

    await AuditLoggerService.createAuditEntry(
      pdfId,
      pdfDocument.originalHash,
      signedHash,
      signedFilePath,
      fields
    );

    res.status(200).json({
      success: true,
      signedPdfUrl: `/api/pdf/download/${pdfId}`,
      originalHash: pdfDocument.originalHash,
      signedHash
    });

  } catch (error) {
    console.error('Sign PDF error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SIGNING_FAILED',
        message: 'Failed to sign PDF',
        details: error.message
      }
    });
  }
};

export const downloadPDF = async (req, res) => {
  try {
    const { pdfId } = req.params;

    if (!pdfId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'PDF ID is required'
        }
      });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const uploadsPath = path.resolve(__dirname, '../../', uploadDir);
    const signedFileName = `signed-${pdfId}.pdf`;
    const signedFilePath = path.join(uploadsPath, signedFileName);

    if (!fs.existsSync(signedFilePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Signed PDF not found'
        }
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="signed-${pdfId}.pdf"`);

    const fileStream = fs.createReadStream(signedFilePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: 'STREAM_ERROR',
            message: 'Error streaming PDF file'
          }
        });
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: {
          code: 'DOWNLOAD_FAILED',
          message: 'Failed to download PDF',
          details: error.message
        }
      });
    }
  }
};
