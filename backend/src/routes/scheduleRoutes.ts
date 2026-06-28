import express from 'express';
import * as scheduleController from '../controllers/scheduleController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // All schedule routes require auth

router.get('/', scheduleController.getByDoctor);
router.post('/', scheduleController.create);
router.delete('/:id', scheduleController.deleteSchedule);

export default router;
