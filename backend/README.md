# PDF Signature Backend

Node.js backend API for the PDF Signature Application.

## Local Development

```bash
npm install
npm run dev
```

The API will run on `http://localhost:5000`

## Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pdf-signature
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## MongoDB Setup

Make sure MongoDB is running locally:

```bash
mongod
```

Or use MongoDB Atlas for cloud database.

## Testing

```bash
npm test
```

## API Endpoints

### POST /api/pdf/upload
Upload a PDF file

**Request:** multipart/form-data with `pdf` field

**Response:**
```json
{
  "success": true,
  "pdfId": "uuid",
  "originalHash": "sha256-hash"
}
```

### POST /api/pdf/sign
Sign a PDF with signature and fields

**Request:**
```json
{
  "pdfId": "uuid",
  "signatureImage": "data:image/png;base64,...",
  "fields": [
    {
      "type": "signature",
      "page": 0,
      "xNorm": 0.5,
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
  "signedPdfUrl": "/api/pdf/download/uuid",
  "originalHash": "sha256-hash",
  "signedHash": "sha256-hash"
}
```

### GET /api/pdf/download/:pdfId
Download signed PDF

**Response:** PDF file stream

## Deployment to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect your repository
5. Render will detect `render.yaml` automatically
6. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `CORS_ORIGIN`: Your frontend URL

### Environment Variables for Production

- `MONGODB_URI`: MongoDB Atlas connection string
- `PORT`: 5000 (or Render's default)
- `CORS_ORIGIN`: https://your-frontend-url.vercel.app
- `UPLOAD_DIR`: ./uploads
- `MAX_FILE_SIZE`: 10485760

## Deployment to Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Railway will detect `railway.json` automatically
5. Add MongoDB plugin
6. Set environment variables:
   - `MONGODB_URI`: Use Railway's MongoDB connection string
   - `CORS_ORIGIN`: Your frontend URL

## Project Structure

```
src/
├── models/         # MongoDB schemas
├── controllers/    # Request handlers
├── routes/         # API routes
├── services/       # Business logic
├── middlewares/    # Custom middleware
├── utils/          # Utility functions
└── __tests__/      # Test files
```

## Testing Models

```bash
node src/models/test-models.js
```
