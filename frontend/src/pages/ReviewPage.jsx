import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import SignaturePad from '../components/SignaturePad';
import '../styles/ReviewPage.css';

function ReviewPage() {
  const { currentPDF, fields, fieldValues, setFieldValue } = useAppContext();
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const navigate = useNavigate();

  // Initialize field values if not already set
  useEffect(() => {
    let needsUpdate = false;
    const updates = {};
    
    fields.forEach(field => {
      if (!(field.id in fieldValues)) {
        needsUpdate = true;
        // Initialize all fields with empty values - each signature field is independent
        updates[field.id] = '';
      }
    });
    
    if (needsUpdate) {
      Object.keys(updates).forEach(fieldId => {
        setFieldValue(fieldId, updates[fieldId]);
      });
    }
  }, [fields, setFieldValue]); // Removed signature dependency

  const handleFieldValueChange = (fieldId, value) => {
    setFieldValue(fieldId, value);
    // Each signature field is now completely independent
    // No need to update global signature state
  };

  const handleBack = () => {
    navigate('/editor');
  };

  const handleSubmit = () => {
    // Check if all required fields are filled
    const emptyFields = fields.filter(field => {
      const value = fieldValues[field.id];
      if (!value) return true;
      
      // Different validation for different field types
      if (field.type === 'signature' || field.type === 'image') {
        return value.length === 0; // Check if data URL exists
      } else {
        return value.trim() === ''; // Check if text is not empty
      }
    });

    if (emptyFields.length > 0) {
      alert(`Please fill in all fields. Missing: ${emptyFields.map((f, i) => `${f.type} ${i + 1}`).join(', ')}`);
      return;
    }
    
    navigate('/submit');
  };

  const currentField = fields[currentFieldIndex];
  const hasMultipleFields = fields.length > 1;

  if (!currentPDF.file) {
    return (
      <div className="review-page">
        <div className="review-empty">
          <h2>No PDF Loaded</h2>
          <p>Please upload a PDF first</p>
          <button onClick={() => navigate('/')}>Go to Upload</button>
        </div>
      </div>
    );
  }

  const renderFieldInput = (field) => {
    const value = fieldValues[field.id] ?? ''; // Use nullish coalescing to ensure string
    
    switch (field.type) {
      case 'signature':
        return (
          <div className="field-input-container">
            <h3>Draw Your Signature - Field {field.id}</h3>
            <SignaturePad
              key={field.id} // Force re-render for each field
              fieldId={field.id}
              initialValue={value}
              onSignatureComplete={(dataUrl) => handleFieldValueChange(field.id, dataUrl)}
              onClear={() => handleFieldValueChange(field.id, '')}
            />
            {value && <p className="field-saved">✓ Signature saved</p>}
          </div>
        );
      
      case 'text':
        return (
          <div className="field-input-container">
            <h3>Enter Text</h3>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
              placeholder="Enter text here..."
              className="text-input"
            />
          </div>
        );
      
      case 'date':
        return (
          <div className="field-input-container">
            <h3>Select Date</h3>
            <input
              type="date"
              value={value}
              onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
              className="date-input"
            />
          </div>
        );
      

      case 'image':
        return (
          <div className="field-input-container">
            <h3>Upload Image</h3>
            <div className="image-upload-area">
              <input
                key={`image-${field.id}-${value ? 'uploaded' : 'empty'}`}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      handleFieldValueChange(field.id, event.target.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="image-file-input"
                id={`image-input-${field.id}`}
              />
              <label htmlFor={`image-input-${field.id}`} className="image-upload-label">
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  {value ? 'Change Image' : 'Choose Image File'}
                </div>
                <div className="upload-hint">PNG, JPG, GIF supported</div>
              </label>
            </div>
            {value && (
              <div className="image-preview">
                <p className="field-saved">✓ Image uploaded successfully</p>
                <button 
                  type="button"
                  onClick={() => handleFieldValueChange(field.id, '')}
                  className="clear-image-button"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="review-page">
      <div className="review-header">
        <h2>Fill in Fields</h2>
        <div className="review-actions">
          <button className="back-button" onClick={handleBack}>
            ← Back to Editor
          </button>
          <button
            className="submit-button"
            onClick={handleSubmit}
          >
            Submit Document
          </button>
        </div>
      </div>

      <div className="review-content">
        <div className="review-info">
          <h3>Document Summary</h3>
          <p><strong>PDF:</strong> {currentPDF.file?.name}</p>
          <p><strong>Total Fields:</strong> {fields.length}</p>
          <p><strong>Completed:</strong> {fields.filter(field => {
            const value = fieldValues[field.id];
            if (!value) return false;
            if (field.type === 'signature' || field.type === 'image') {
              return value.length > 0;
            } else {
              return value.trim() !== '';
            }
          }).length} / {fields.length}</p>
        </div>

        {hasMultipleFields && (
          <div className="field-navigation">
            <h3>Fields to Complete</h3>
            <div className="field-tabs">
              {fields.map((field, index) => (
                <button
                  key={field.id}
                  className={`field-tab ${index === currentFieldIndex ? 'active' : ''} ${(() => {
                    const value = fieldValues[field.id];
                    if (!value) return '';
                    if (field.type === 'signature' || field.type === 'image') {
                      return value.length > 0 ? 'completed' : '';
                    } else {
                      return value.trim() !== '' ? 'completed' : '';
                    }
                  })()}`}
                  onClick={() => setCurrentFieldIndex(index)}
                >
                  {field.type} {index + 1} {(() => {
                    const value = fieldValues[field.id];
                    if (!value) return '';
                    if (field.type === 'signature' || field.type === 'image') {
                      return value.length > 0 ? '✓' : '';
                    } else {
                      return value.trim() !== '' ? '✓' : '';
                    }
                  })()}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field-input-section">
          {currentField && (
            <>
              <div className="field-info">
                <h4>Field {currentFieldIndex + 1} of {fields.length}: {currentField.type}</h4>
                <p>Page {currentField.page + 1}</p>
              </div>
              {renderFieldInput(currentField)}
            </>
          )}
          
          {hasMultipleFields && (
            <div className="field-navigation-buttons">
              <button
                className="nav-button"
                onClick={() => setCurrentFieldIndex(Math.max(0, currentFieldIndex - 1))}
                disabled={currentFieldIndex === 0}
              >
                ← Previous Field
              </button>
              <button
                className="nav-button"
                onClick={() => setCurrentFieldIndex(Math.min(fields.length - 1, currentFieldIndex + 1))}
                disabled={currentFieldIndex === fields.length - 1}
              >
                Next Field →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewPage;
