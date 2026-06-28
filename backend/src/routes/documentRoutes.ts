import express from 'express';
import * as documentController from '../controllers/documentController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.use(authenticateToken);

// File upload endpoint (just uploads file and returns metadata)
router.post('/upload', upload.single('file'), documentController.uploadFile);

// Document management endpoints (stores metadata in DB)
router.post('/', documentController.createDocument);
router.get('/by-patient', documentController.getByPatient);
router.delete('/:id', documentController.deleteDocument);

export default router;
