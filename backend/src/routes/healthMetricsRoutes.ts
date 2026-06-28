import express from 'express';
import * as healthMetricsController from '../controllers/healthMetricsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // All health metrics routes require auth

router.get('/', healthMetricsController.getAll);
router.get('/by-patient', healthMetricsController.getByPatient);
router.get('/latest', healthMetricsController.getLatestByType);
router.get('/history', healthMetricsController.getHistory);
router.get('/:id', healthMetricsController.getById);
router.post('/', healthMetricsController.create);
router.put('/:id', healthMetricsController.update);
router.delete('/:id', healthMetricsController.deleteMetric);

export default router;
