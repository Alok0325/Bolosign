import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import '../styles/SignaturePad.css';

function SignaturePad({ fieldId, initialValue, onSignatureComplete, onClear }) {
  const sigCanvas = useRef(null);
  const [isEmpty, setIsEmpty] = useState(!initialValue);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load initial signature if provided
  useEffect(() => {
    if (initialValue && sigCanvas.current && !hasInitialized) {
      try {
        sigCanvas.current.fromDataURL(initialValue);
        setIsEmpty(false);
        setHasInitialized(true);
      } catch (error) {
        console.error('Error loading initial signature:', error);
      }
    }
  }, [initialValue, hasInitialized]);

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
      setHasInitialized(false);
      if (onClear) {
        onClear();
      }
    }
  };

  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      if (onSignatureComplete) {
        onSignatureComplete(dataUrl);
      }
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  return (
    <div className="signature-pad">
      <div className="signature-canvas-container">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'signature-canvas',
            width: 500,
            height: 200,
            id: `signature-canvas-${fieldId || 'default'}` // Unique ID for each field
          }}
          onBegin={handleBegin}
          backgroundColor="white"
          penColor="black"
        />
        {isEmpty && (
          <div className="signature-placeholder">
            Sign here
          </div>
        )}
      </div>

      <div className="signature-controls">
        <button
          className="signature-button clear-button"
          onClick={handleClear}
          disabled={isEmpty}
        >
          Clear
        </button>
        <button
          className="signature-button save-button"
          onClick={handleSave}
          disabled={isEmpty}
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}

export default SignaturePad;
