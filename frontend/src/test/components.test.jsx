import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import PDFUpload from '../components/PDFUpload';
import SignaturePad from '../components/SignaturePad';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('Component Tests', () => {
  describe('PDFUpload', () => {
    test('should render upload zone', () => {
      renderWithRouter(<PDFUpload />);
      expect(screen.getByText(/drag and drop your pdf/i)).toBeInTheDocument();
    });

    test('should show error for invalid file type', async () => {
      renderWithRouter(<PDFUpload />);
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]');
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });

      fireEvent.change(input);

      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  describe('SignaturePad', () => {
    test('should render signature canvas', () => {
      const mockOnComplete = vi.fn();
      const mockOnClear = vi.fn();

      render(
        <SignaturePad
          onSignatureComplete={mockOnComplete}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText(/sign here/i)).toBeInTheDocument();
    });

    test('should have clear and save buttons', () => {
      const mockOnComplete = vi.fn();
      const mockOnClear = vi.fn();

      render(
        <SignaturePad
          onSignatureComplete={mockOnComplete}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText(/clear/i)).toBeInTheDocument();
      expect(screen.getByText(/save signature/i)).toBeInTheDocument();
    });
  });
});
