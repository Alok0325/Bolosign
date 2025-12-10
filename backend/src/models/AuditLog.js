import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['signature', 'text', 'date', 'image']
  },
  page: {
    type: Number,
    required: true
  },
  xNorm: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  yNormTop: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  wNorm: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  hNorm: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  }
}, { _id: false });

const auditLogSchema = new mongoose.Schema({
  pdfId: {
    type: String,
    required: true,
    index: true
  },
  originalHash: {
    type: String,
    required: true
  },
  signedHash: {
    type: String,
    required: true
  },
  signedFilePath: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  fields: [fieldSchema]
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
