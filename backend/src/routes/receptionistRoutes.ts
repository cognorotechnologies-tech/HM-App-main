import express from 'express';
import * as receptionistController from '../controllers/receptionistController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', receptionistController.getStats);
router.post('/register', receptionistController.registerPatient);
router.get('/queue', receptionistController.getQueue);
router.put('/visits/:id/status', receptionistController.updateStatus);
router.post('/visits', receptionistController.createVisit);

export default router;
