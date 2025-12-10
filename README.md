# PDF Signature Application

A full-stack web application for digitally signing PDF documents with drag-and-drop field placement and cryptographic audit trail capabilities.

## 🎯 Features

- **PDF Upload & Viewing**: Upload and render PDF documents in the browser using PDF.js
- **Drag-and-Drop Fields**: Place signature, text, date, radio, and image fields on PDFs
- **Responsive Field Positioning**: Fields maintain relative position across different screen sizes
- **Digital Signature Capture**: Draw signatures with high-quality canvas (300 DPI equivalent)
- **Normalized Coordinates**: Cross-device compatibility through coordinate normalization (0-1 range)
- **Precise PDF Generation**: Backend inserts signatures at exact coordinates with aspect ratio preservation
- **Cryptographic Audit Trail**: SHA-256 hashing for document integrity verification
- **MongoDB Logging**: Complete audit logs with timestamps and field data

## 📁 Project Structure

```
pdf-signature-app/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # PDFUpload, PDFViewer, FieldOverlay, SignaturePad
│   │   ├── pages/         # HomePage, EditorPage, ReviewPage, SubmitPage
│   │   ├── context/       # AppContext for global state
│   │   ├── services/      # API service layer (axios)
│   │   ├── utils/         # coordinateNormalizer utility
│   │   ├── styles/        # Component-specific CSS files
│   │   └── test/          # Vitest unit & integration tests
│   ├── vercel.json        # Vercel deployment config
│   └── package.json
├── backend/               # Node.js + Express backend
│   ├── src/
│   │   ├── models/        # PDFDocument & AuditLog schemas
│   │   ├── controllers/   # pdfController (upload, sign, download)
│   │   ├── routes/        # pdfRoutes
│   │   ├── services/      # PDFGeneratorService, AuditLoggerService
│   │   ├── middlewares/   # upload (multer), errorHandler
│   │   ├── utils/         # database, hash utilities
│   │   └── __tests__/     # Jest unit & integration tests
│   ├── uploads/           # PDF storage directory
│   ├── render.yaml        # Render deployment config
│   ├── railway.json       # Railway deployment config
│   └── package.json
└── README.md
```

## 💻 Tech Stack

### Frontend
- **React 18+** with **Vite** - Fast build tool and dev server
- **PDF.js** - PDF rendering in browser
- **react-rnd** - Drag-and-resize functionality
- **react-signature-canvas** - Signature capture
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client
- **Vitest** - Unit testing

### Backend
- **Node.js 18+** with **Express.js** - REST API server
- **MongoDB** with **Mongoose** - Document database
- **pdf-lib** - PDF manipulation and signature insertion
- **multer** - File upload handling
- **crypto** (built-in) - SHA-256 hashing
- **cors** - Cross-origin resource sharing
- **Jest** & **Supertest** - API testing

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running
- npm or yarn package manager

### 1. Clone Repository

```bash
git clone <repository-url>
cd pdf-signature-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pdf-signature
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

Start MongoDB:
```bash
mongod
```

Start backend server:
```bash
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

App runs at `http://localhost:3000`

## 📡 API Documentation

### POST /api/pdf/upload
Upload a PDF file for signing

**Request:** `multipart/form-data` with `pdf` field

**Response:**
```json
{
  "success": true,
  "pdfId": "550e8400-e29b-41d4-a716-446655440000",
  "originalHash": "a3c5f8d2e1b4..."
}
```

### POST /api/pdf/sign
Generate signed PDF with signature and fields

**Request:**
```json
{
  "pdfId": "550e8400-e29b-41d4-a716-446655440000",
  "signatureImage": "data:image/png;base64,iVBORw0KGgo...",
  "fields": [
    {
      "type": "signature",
      "page": 0,
      "xNorm": 0.25,
      "yNormTop": 0.5,
      "wNorm": 0.2,
      "hNorm": 0.1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "signedPdfUrl": "/api/pdf/download/550e8400-e29b-41d4-a716-446655440000",
  "originalHash": "a3c5f8d2e1b4...",
  "signedHash": "b7d9e3f1a2c5..."
}
```

### GET /api/pdf/download/:pdfId
Download signed PDF

**Response:** PDF file stream with `Content-Type: application/pdf`

## 🎨 Coordinate System Explained

The application uses **normalized coordinates** (0-1 range) to ensure signatures appear correctly across different devices and screen sizes.

### Frontend Coordinate System (Top-Left Origin)

```
┌─────────────────────┐ (0, 0)
│                     │
│     ┌─────┐         │
│     │Field│         │ yNormTop = y / pageHeight
│     └─────┘         │
│                     │
└─────────────────────┘
xNorm = x / pageWidth
```

**Normalization Formulas:**
- `xNorm = xPixels / pageWidth`
- `yNormTop = yPixels / pageHeight`
- `wNorm = widthPixels / pageWidth`
- `hNorm = heightPixels / pageHeight`

### PDF Coordinate System (Bottom-Left Origin)

```
│                     │
│     ┌─────┐         │
│     │Field│         │
│     └─────┘         │
│                     │
└─────────────────────┘ (0, 0)
```

**Backend Conversion Formulas:**
- `xPt = xNorm × pdfWidth`
- `yPt = pdfHeight - (yNormTop × pdfHeight) - (hNorm × pdfHeight)`
- `wPt = wNorm × pdfWidth`
- `hPt = hNorm × pdfHeight`

### Example Conversion

**Frontend (800×1000px page):**
- Field at x=200, y=500, width=160, height=100

**Normalized:**
- xNorm=0.25, yNormTop=0.5, wNorm=0.2, hNorm=0.1

**PDF (595×842pt page):**
- xPt=148.75, yPt=337.9, wPt=119, hPt=84.2

The signature appears at the **same relative position** regardless of screen or PDF dimensions!

## 🔐 Cryptographic Audit Trail

The application maintains document integrity through SHA-256 hashing:

### Hash Computation

1. **Upload**: Original PDF hash computed and stored
2. **Signing**: Signed PDF hash computed after signature insertion
3. **Storage**: Both hashes stored in MongoDB with ISO timestamp

### Audit Log Schema

```javascript
{
  pdfId: "550e8400-e29b-41d4-a716-446655440000",
  originalHash: "a3c5f8d2e1b4c9a7...",
  signedHash: "b7d9e3f1a2c5e8d4...",
  signedFilePath: "./uploads/signed-550e8400.pdf",
  timestamp: "2025-12-09T11:30:00.000Z",
  fields: [
    {
      type: "signature",
      page: 0,
      xNorm: 0.25,
      yNormTop: 0.5,
      wNorm: 0.2,
      hNorm: 0.1
    }
  ]
}
```

### Verification

Compare stored hash with recomputed hash to verify document hasn't been tampered with.

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

**Test Coverage:**
- Coordinate conversion logic
- SHA-256 hash computation
- Payload validation
- API endpoints (upload, sign, download)
- Audit log creation

### Frontend Tests

```bash
cd frontend
npm test
```

**Test Coverage:**
- Coordinate normalizer utility
- API service methods
- Component rendering
- Form validation
- Responsive field positioning

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import repository
3. Vercel auto-detects `vercel.json` configuration
4. Set environment variable:
   - `VITE_API_BASE_URL`: `https://your-backend-url.com`
5. Deploy

**Automatic Deployments:** Every push to `main` branch triggers deployment

### Backend Deployment (Render)

1. Push code to GitHub
2. Go to [render.com](https://render.com) and create Web Service
3. Connect repository (Render auto-detects `render.yaml`)
4. Set environment variables:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `CORS_ORIGIN`: `https://your-frontend-url.vercel.app`
   - `PORT`: `5000`
   - `UPLOAD_DIR`: `./uploads`
   - `MAX_FILE_SIZE`: `10485760`
5. Enable persistent disk (1GB) for PDF storage
6. Deploy

### Backend Deployment (Railway)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) and create project
3. Connect repository (Railway auto-detects `railway.json`)
4. Add MongoDB plugin
5. Set environment variables (same as Render)
6. Deploy

### MongoDB Setup (Production)

Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud database:

1. Create free cluster
2. Add database user
3. Whitelist IP addresses (or allow all for development)
4. Get connection string
5. Add to backend environment variables

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem:** `MongoServerError: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For Atlas: Verify IP whitelist and credentials
- Check network/firewall settings

### File Upload Errors

**Problem:** `EPERM: operation not permitted`

**Solutions:**
- Verify `uploads/` directory exists
- Check write permissions: `chmod 755 uploads`
- Ensure sufficient disk space
- On Windows: Close any programs accessing the files

### CORS Errors

**Problem:** `Access-Control-Allow-Origin` error

**Solutions:**
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check both servers are running
- Clear browser cache and cookies
- For production: Ensure HTTPS URLs match exactly

### PDF Rendering Issues

**Problem:** PDF not displaying in browser

**Solutions:**
- Check PDF.js worker URL in `PDFViewer.jsx`
- Verify PDF file is valid (not corrupted)
- Check browser console for errors
- Try different PDF file

### Signature Not Appearing

**Problem:** Signature missing from downloaded PDF

**Solutions:**
- Verify normalized coordinates are between 0-1
- Check field placement on correct page
- Ensure signature image is valid Base64 PNG
- Review backend logs for PDF generation errors

## 📝 License

MIT

## 🎥 Loom Video Script

See `LOOM_SCRIPT.md` for a detailed explanation script covering:
- Coordinate normalization system
- Frontend to backend workflow
- SHA-256 hashing and audit trail
- Visual examples and demonstrations
