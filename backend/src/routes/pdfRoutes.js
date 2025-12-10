import express from 'express';
import upload from '../middlewares/upload.js';
import { uploadPDF, signPDF, downloadPDF } from '../controllers/pdfController.js';

const router = express.Router();

router.post('/upload', upload.single('pdf'), uploadPDF);
router.post('/sign', signPDF);
router.get('/download/:pdfId', downloadPDF);

export default router;
