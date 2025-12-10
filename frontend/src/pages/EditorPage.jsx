import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import { useAppContext } from '../context/AppContext';
import PDFViewer from '../components/PDFViewer';
import FieldOverlay from '../components/FieldOverlay';
import '../styles/EditorPage.css';

function EditorPage() {
  const { currentPDF, fields, setPageDimensions, updateField, removeField, currentPage, setCurrentPage } = useAppContext();
  const [pageDimensions, setLocalPageDimensions] = useState(null);
  const [numPages, setNumPages] = useState(1);
  const navigate = useNavigate();

  const handlePageLoad = useCallback((pageNumber, dimensions, totalPages) => {
    console.log('Page loaded:', pageNumber, dimensions);
    setLocalPageDimensions(dimensions);
    setPageDimensions(pageNumber, dimensions);
    if (totalPages) {
      setNumPages(totalPages);
    }
  }, [setPageDimensions]);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleNext = () => {
    if (fields.length === 0) {
      alert('Please add at least one field before proceeding');
      return;
    }
    navigate('/review');
  };

  const handleDragStop = (fieldId, d) => {
    if (!pageDimensions) return;
    
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const maxX = pageDimensions.width - field.width;
    const maxY = pageDimensions.height - field.height;

    const boundedX = Math.max(0, Math.min(d.x, maxX));
    const boundedY = Math.max(0, Math.min(d.y, maxY));

    updateField(fieldId, { x: boundedX, y: boundedY });
  };

  const handleResizeStop = (fieldId, ref, position) => {
    if (!pageDimensions) return;

    const width = parseInt(ref.style.width);
    const height = parseInt(ref.style.height);

    const maxX = pageDimensions.width - width;
    const maxY = pageDimensions.height - height;

    const boundedX = Math.max(0, Math.min(position.x, maxX));
    const boundedY = Math.max(0, Math.min(position.y, maxY));

    updateField(fieldId, {
      x: boundedX,
      y: boundedY,
      width,
      height
    });
  };

  if (!currentPDF.file) {
    return (
      <div className="editor-page">
        <div className="editor-empty">
          <h2>No PDF Loaded</h2>
          <p>Please upload a PDF first</p>
          <button onClick={() => navigate('/')}>Go to Upload</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div className="editor-title">
          <h2>Place Fields on PDF</h2>
          {numPages > 1 && (
            <div className="page-navigation">
              <button 
                className="page-nav-button" 
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {currentPage + 1} of {numPages}
              </span>
              <button 
                className="page-nav-button" 
                onClick={handleNextPage}
                disabled={currentPage === numPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </div>
        <button className="next-button" onClick={handleNext}>
          Next: Review & Sign →
        </button>
      </div>

      <div className="editor-content">
        <div className="field-palette-container">
          <FieldOverlay pageDimensions={pageDimensions} />
        </div>
        
        <div className="pdf-workspace">
          <div className="pdf-container">
            {currentPDF.file && (
              <PDFViewer
                pdfFile={currentPDF.file}
                onPageLoad={handlePageLoad}
                currentPage={currentPage}
              />
            )}
            {pageDimensions && (
              <div
                className="field-canvas-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: pageDimensions.width,
                  height: pageDimensions.height,
                  pointerEvents: 'none'
                }}
              >
                {fields.filter(field => field.page === currentPage).map((field) => (
                  <Rnd
                    key={field.id}
                    position={{ x: field.x, y: field.y }}
                    size={{ width: field.width, height: field.height }}
                    onDragStop={(_, d) => handleDragStop(field.id, d)}
                    onResizeStop={(_, __, ref, ___, position) =>
                      handleResizeStop(field.id, ref, position)
                    }
                    bounds="parent"
                    className={`draggable-field field-${field.type}`}
                    style={{ pointerEvents: 'all' }}
                  >
                    <div className="field-content">
                      <span className="field-type-label">{field.type}</span>
                      <button
                        className="field-remove"
                        onClick={() => removeField(field.id)}
                        title="Remove field"
                      >
                        ×
                      </button>
                    </div>
                  </Rnd>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
