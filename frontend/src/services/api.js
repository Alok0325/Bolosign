import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bolosign-ug0m.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const uploadPDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await api.post('/api/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { error: { message: 'Upload failed' } };
  }
};

export const submitSignedPDF = async (payload) => {
  try {
    const response = await api.post('/api/pdf/sign', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: { message: 'Signing failed' } };
  }
};

export const getDownloadUrl = (pdfId) => {
  return `${API_BASE_URL}/api/pdf/download/${pdfId}`;
};

export default api;
