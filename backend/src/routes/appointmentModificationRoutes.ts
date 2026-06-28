import express from 'express';
import * as appointmentModificationController from '../controllers/appointmentModificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // All modification routes require auth

router.get('/', appointmentModificationController.getModificationsByAppointment);
router.post('/', appointmentModificationController.createModification);
router.post('/:id/reschedule', appointmentModificationController.rescheduleAppointment);
router.post('/:id/cancel', appointmentModificationController.cancelAppointment);

export default router;
