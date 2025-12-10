# PDF Signature Frontend

React frontend for the PDF Signature Application.

## Local Development

```bash
npm install
npm run dev
```

The app will run on `http://localhost:3000`

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Build for Production

```bash
npm run build
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set environment variable:
   - `VITE_API_BASE_URL`: Your backend API URL

### Environment Variables for Production

In Vercel dashboard, add:
- `VITE_API_BASE_URL`: `https://your-backend-url.com`

## Testing

```bash
npm test
```

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── context/        # React Context
├── services/       # API services
├── utils/          # Utility functions
├── styles/         # CSS files
└── test/           # Test files
```
