import crypto from 'crypto';
import { AuditLog } from '../models/index.js';
import { computeFileHash, computeBufferHash } from '../utils/hash.js';

class AuditLoggerService {
  computeHash(data) {
    if (Buffer.isBuffer(data)) {
      return computeBufferHash(data);
    } else if (typeof data === 'string') {
      return crypto.createHash('sha256').update(data).digest('hex');
    } else {
      throw new Error('Invalid data type for hash computation');
    }
  }

  async createAuditEntry(pdfId, originalHash, signedHash, signedFilePath, fields) {
    try {
      const auditLog = new AuditLog({
        pdfId,
        originalHash,
        signedHash,
        signedFilePath,
        timestamp: new Date(),
        fields: fields || []
      });

      await auditLog.save();
      return auditLog;
      
    } catch (error) {
      console.error('Audit log creation error:', error);
      throw error;
    }
  }

  async getAuditLogs(pdfId) {
    try {
      return await AuditLog.find({ pdfId }).sort({ timestamp: -1 });
    } catch (error) {
      console.error('Error retrieving audit logs:', error);
      throw error;
    }
  }

  async verifyDocumentIntegrity(pdfId, expectedHash) {
    try {
      const auditLogs = await this.getAuditLogs(pdfId);
      
      if (auditLogs.length === 0) {
        return { verified: false, message: 'No audit logs found' };
      }

      const latestLog = auditLogs[0];
      const isValid = latestLog.signedHash === expectedHash;

      return {
        verified: isValid,
        message: isValid ? 'Document integrity verified' : 'Document hash mismatch',
        auditLog: latestLog
      };
      
    } catch (error) {
      console.error('Error verifying document integrity:', error);
      throw error;
    }
  }
}

export default new AuditLoggerService();
