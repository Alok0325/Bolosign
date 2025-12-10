import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import '../styles/FieldOverlay.css';

const FIELD_TYPES = [
  { type: 'signature', label: 'Signature', icon: '✍️' },
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'image', label: 'Image', icon: '🖼️' }
];

function FieldOverlay({ pageDimensions }) {
  const { fields, addField, removeField, currentPage } = useAppContext();
  const [nextId, setNextId] = useState(1);
  
  const currentPageFields = fields.filter(field => field.page === currentPage);

  const handleAddField = (fieldType) => {
    if (!pageDimensions || !pageDimensions.width || !pageDimensions.height) {
      alert('Please wait for PDF to load');
      return;
    }

    const newField = {
      id: `field-${nextId}`,
      type: fieldType,
      page: currentPage,
      x: 50,
      y: 50,
      width: 150,
      height: 60
    };

    addField(newField);
    setNextId(nextId + 1);
  };



  if (!pageDimensions || !pageDimensions.width) {
    return (
      <div className="field-palette">
        <h3>Add Fields</h3>
        <p className="loading-message">Waiting for PDF to load...</p>
      </div>
    );
  }

  return (
    <>
      {/* Field Palette - rendered in sidebar */}
      <div className="field-palette">
        <h3>Add Fields</h3>
        <div className="field-buttons">
          {FIELD_TYPES.map(({ type, label, icon }) => (
            <button
              key={type}
              className="field-button"
              onClick={() => handleAddField(type)}
              title={`Add ${label}`}
            >
              <span className="field-icon">{icon}</span>
              <span className="field-label">{label}</span>
            </button>
          ))}
        </div>
        
        {currentPageFields.length > 0 && (
          <div className="field-list">
            <h4>Page {currentPage + 1} Fields ({currentPageFields.length})</h4>
            <div className="field-items">
              {currentPageFields.map((field) => (
                <div key={field.id} className="field-item">
                  <span className="field-item-type">{field.type}</span>
                  <button
                    className="field-item-remove"
                    onClick={() => removeField(field.id)}
                    title="Remove field"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


    </>
  );
}

export default FieldOverlay;
