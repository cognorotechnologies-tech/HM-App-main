import { Router } from 'express';
import { labResultController } from '../controllers/labResultController';

const router = Router();

router.post('/', labResultController.uploadAndAnalyze); // Or .create
router.get('/patient/:patientId', labResultController.getByPatient);

export default router;
