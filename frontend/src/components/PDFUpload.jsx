import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { uploadPDF } from '../services/api';
import '../styles/PDFUpload.css';

function PDFUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const { setPDF } = useAppContext();
  const navigate = useNavigate();

  const validateFile = (file) => {
    if (!file) {
      return 'No file selected';
    }

    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFileUpload = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await uploadPDF(file);
      setPDF(file, response.pdfId);
      navigate('/editor');
    } catch (err) {
      setError(err.error?.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="pdf-upload">
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="pdf-input"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="file-input"
        />
        <label htmlFor="pdf-input" className="upload-label">
          {uploading ? (
            <div className="uploading">
              <div className="spinner"></div>
              <p>Uploading...</p>
            </div>
          ) : (
            <>
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="upload-text">
                Drag and drop your PDF here, or click to browse
              </p>
              <p className="upload-hint">Maximum file size: 10MB</p>
            </>
          )}
        </label>
      </div>
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default PDFUpload;
