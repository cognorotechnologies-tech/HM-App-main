import express from 'express';
import { transcriptController } from '../controllers/transcriptController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, transcriptController.save);
router.get('/appointment/:appointmentId', authenticateToken, transcriptController.getByAppointment);

export default router;
