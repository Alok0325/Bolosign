import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import '../styles/PDFViewer.css';

// Use local worker file from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

function PDFViewer({ pdfFile, onPageLoad, currentPage = 0 }) {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadPDF = async () => {
      if (!pdfFile) return;

      setLoading(true);
      setError(null);

      try {
        let pdfData;
        if (pdfFile instanceof File) {
          const arrayBuffer = await pdfFile.arrayBuffer();
          pdfData = new Uint8Array(arrayBuffer);
        } else {
          pdfData = pdfFile;
        }

        const loadedPdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        
        if (isMounted) {
          setPdf(loadedPdf);
          setNumPages(loadedPdf.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (isMounted) {
          setError('Failed to load PDF. Please try again.');
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
    };
  }, [pdfFile]);

  useEffect(() => {
    let renderTask = null;
    
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;

      try {
        // Cancel any ongoing render task
        if (renderTask) {
          renderTask.cancel();
        }

        const page = await pdf.getPage(currentPage + 1);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        const viewport = page.getViewport({ scale: 1.2 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;

        if (onPageLoad) {
          onPageLoad(currentPage, {
            width: viewport.width,
            height: viewport.height
          }, numPages);
        }
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
        }
      }
    };

    if (pdf && numPages > 0) {
      renderPage();
    }

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, currentPage, numPages]); // Removed onPageLoad from dependencies

  if (loading) {
    return (
      <div className="pdf-viewer loading">
        <div className="spinner"></div>
        <p>Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-canvas-container">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
      {numPages > 1 && (
        <div className="pdf-navigation">
          <p>Page {currentPage + 1} of {numPages}</p>
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
