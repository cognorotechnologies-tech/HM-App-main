import { Router } from 'express';
import { followUpController } from '../controllers/followUpController';

const router = Router();

router.post('/', followUpController.create);
router.get('/doctor/:doctorId/upcoming', followUpController.getUpcoming);
router.get('/patient/:patientId', followUpController.getByPatient);
router.patch('/:id/status', followUpController.updateStatus);

export default router;
