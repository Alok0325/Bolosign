import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentPDF, setCurrentPDF] = useState({
    file: null,
    pdfId: null,
    dimensions: []
  });

  const [fields, setFields] = useState([]);
  const [signature, setSignature] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [fieldValues, setFieldValues] = useState({});

  const setPDF = (file, pdfId) => {
    setCurrentPDF({
      file,
      pdfId,
      dimensions: []
    });
  };

  const addField = (field) => {
    setFields(prev => [...prev, field]);
  };

  const updateField = (id, updates) => {
    setFields(prev =>
      prev.map(field => field.id === id ? { ...field, ...updates } : field)
    );
  };

  const removeField = (id) => {
    setFields(prev => prev.filter(field => field.id !== id));
  };

  const setPageDimensions = (pageNumber, dimensions) => {
    setCurrentPDF(prev => {
      const newDimensions = [...prev.dimensions];
      newDimensions[pageNumber] = dimensions;
      return { ...prev, dimensions: newDimensions };
    });
  };

  const setFieldValue = (fieldId, value) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const resetState = () => {
    setCurrentPDF({ file: null, pdfId: null, dimensions: [] });
    setFields([]);
    setSignature(null);
    setCurrentPage(0);
    setFieldValues({});
  };

  const value = {
    currentPDF,
    fields,
    signature,
    currentPage,
    fieldValues,
    setPDF,
    addField,
    updateField,
    removeField,
    setSignature,
    setCurrentPage,
    setPageDimensions,
    setFieldValue,
    resetState
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
