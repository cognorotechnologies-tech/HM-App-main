import express from 'express';
import * as prescriptionController from '../controllers/prescriptionController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // All prescription routes require auth

router.get('/', prescriptionController.getAllPrescriptions);
router.get('/by-patient', prescriptionController.getPrescriptionsByPatient);
router.get('/by-appointment', prescriptionController.getPrescriptionsByAppointment);
router.get('/:id', prescriptionController.getPrescriptionById);
router.post('/', prescriptionController.createPrescription);
router.put('/:id', prescriptionController.updatePrescription);
router.delete('/:id', prescriptionController.deletePrescription);

export default router;
