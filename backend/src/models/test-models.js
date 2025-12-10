import { connectDB, disconnectDB } from '../utils/database.js';
import { PDFDocument, AuditLog } from './index.js';

const testModels = async () => {
  try {
    await connectDB();
    console.log('Testing MongoDB models...\n');

    const testPdfId = 'test-pdf-' + Date.now();
    
    const pdfDoc = new PDFDocument({
      pdfId: testPdfId,
      originalFileName: 'test.pdf',
      originalHash: 'abc123hash',
      filePath: './uploads/test.pdf'
    });

    await pdfDoc.save();
    console.log('✓ PDFDocument created:', pdfDoc.pdfId);

    const auditLog = new AuditLog({
      pdfId: testPdfId,
      originalHash: 'abc123hash',
      signedHash: 'def456hash',
      signedFilePath: './uploads/test-signed.pdf',
      fields: [
        {
          type: 'signature',
          page: 0,
          xNorm: 0.25,
          yNormTop: 0.5,
          wNorm: 0.2,
          hNorm: 0.1
        }
      ]
    });

    await auditLog.save();
    console.log('✓ AuditLog created:', auditLog._id);

    const foundPdf = await PDFDocument.findOne({ pdfId: testPdfId });
    console.log('✓ PDFDocument retrieved:', foundPdf.originalFileName);

    const foundAudit = await AuditLog.findOne({ pdfId: testPdfId });
    console.log('✓ AuditLog retrieved with', foundAudit.fields.length, 'fields');

    await PDFDocument.deleteOne({ pdfId: testPdfId });
    await AuditLog.deleteOne({ pdfId: testPdfId });
    console.log('✓ Test documents cleaned up');

    console.log('\n✓ All model tests passed!');
    
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('✗ Model test failed:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

testModels();
