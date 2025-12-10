import React from 'react';
import PDFUpload from '../components/PDFUpload';
import '../styles/HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <div className="home-header">
        <h1>PDF Signature Application</h1>
        <p>Upload and sign PDF documents digitally</p>
      </div>
      <PDFUpload />
    </div>
  );
}

export default HomePage;
