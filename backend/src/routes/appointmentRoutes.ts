import express from 'express';
import * as appointmentController from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // All appointment routes require auth

router.get('/', appointmentController.getAll);
router.get('/by-patient', appointmentController.getByPatient);
router.get('/by-doctor', appointmentController.getByDoctor);
router.get('/check-availability', appointmentController.checkAvailability);
router.get('/:id', appointmentController.getById);
router.post('/', appointmentController.create);
router.put('/:id/status', appointmentController.updateStatus);
router.put('/:id', appointmentController.update);
router.delete('/:id', appointmentController.deleteAppointment);

export default router;
