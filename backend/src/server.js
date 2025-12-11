import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/database.js';
import pdfRoutes from './routes/pdfRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to handle multiple origins
const allowedOrigins = [
  'http://localhost:3000', 
  'https://bolosign-5aru.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // If CORS_ORIGIN is set in environment, use that as well
    if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PDF Signature API is running' });
});

app.use('/api/pdf', pdfRoutes);

import { errorHandler } from './middlewares/errorHandler.js';
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
