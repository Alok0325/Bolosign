import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { submitSignedPDF, getDownloadUrl } from '../services/api';
import { normalizeAllFields } from '../utils/coordinateNormalizer';
import '../styles/SubmitPage.css';

function SubmitPage() {
  const { currentPDF, fields, fieldValues, resetState } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have all required data
    const hasAllFieldValues = fields.every(f => {
      const value = fieldValues[f.id];
      if (!value) return false;
      
      // Different validation for different field types
      if (f.type === 'signature' || f.type === 'image') {
        return value.length > 0; // Check if data URL exists
      } else {
        return value.trim() !== ''; // Check if text is not empty
      }
    });
    
    if (!currentPDF.pdfId || fields.length === 0 || !hasAllFieldValues) {
      console.log('Validation failed:', {
        pdfId: currentPDF.pdfId,
        fieldsLength: fields.length,
        hasAllFieldValues,
        fieldValues
      });
      navigate('/');
      return;
    }
    handleSubmit();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Normalize fields for all pages
      const normalizedFields = [];
      
      for (const field of fields) {
        const pageDimensions = currentPDF.dimensions[field.page];
        
        if (!pageDimensions) {
          throw new Error(`Page dimensions not available for page ${field.page + 1}`);
        }

        const normalizedField = normalizeAllFields([field], pageDimensions)[0];
        
        // Add the field value
        normalizedField.value = fieldValues[field.id];
        
        normalizedFields.push(normalizedField);
      }

      // Don't send a global signature image - each signature field has its own value
      // The backend will use field.value for each signature field individually
      const payload = {
        pdfId: currentPDF.pdfId,
        signatureImage: null, // No global signature needed
        fields: normalizedFields
      };

      const response = await submitSignedPDF(payload);

      setResult(response);
      setSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.error?.message || 'Failed to submit PDF');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (result && result.signedPdfUrl) {
      const downloadUrl = getDownloadUrl(currentPDF.pdfId);
      window.open(downloadUrl, '_blank');
    }
  };

  const handleNewDocument = () => {
    resetState();
    navigate('/');
  };

  if (submitting) {
    return (
      <div className="submit-page">
        <div className="submit-status">
          <div className="spinner"></div>
          <h2>Processing Your Document...</h2>
          <p>Please wait while we generate your signed PDF</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submit-page">
        <div className="submit-status error">
          <div className="error-icon">✗</div>
          <h2>Submission Failed</h2>
          <p>{error}</p>
          <div className="submit-actions">
            <button onClick={() => navigate('/review')}>Try Again</button>
            <button onClick={handleNewDocument}>Start Over</button>
          </div>
        </div>
      </div>
    );
  }

  if (success && result) {
    return (
      <div className="submit-page">
        <div className="submit-status success">
          <div className="success-icon">✓</div>
          <h2>Document Signed Successfully!</h2>
          <p>Your PDF has been signed and is ready for download</p>

          <div className="result-details">
            <h3>Document Details</h3>
            <div className="detail-item">
              <span className="detail-label">Original Hash:</span>
              <span className="detail-value">{result.originalHash}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Signed Hash:</span>
              <span className="detail-value">{result.signedHash}</span>
            </div>
          </div>

          <div className="submit-actions">
            <button className="download-button" onClick={handleDownload}>
              Download Signed PDF
            </button>
            <button className="new-doc-button" onClick={handleNewDocument}>
              Sign Another Document
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default SubmitPage;
