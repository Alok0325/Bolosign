import mongoose from 'mongoose';

const pdfDocumentSchema = new mongoose.Schema({
  pdfId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  originalHash: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const PDFDocument = mongoose.model('PDFDocument', pdfDocumentSchema);

export default PDFDocument;
