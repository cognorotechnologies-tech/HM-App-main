import { Router } from 'express';
import * as PatientController from '../controllers/patientController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', PatientController.getPatients);
router.get('/:id', PatientController.getById);
router.post('/', PatientController.createPatient);
router.put('/:id', PatientController.updatePatient);

export default router;
