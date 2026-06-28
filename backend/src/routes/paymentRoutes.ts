import express from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // All payment routes require auth

router.get('/', paymentController.getAllTransactions);
router.get('/:id', paymentController.getTransactionById);
router.post('/', paymentController.createTransaction);
router.put('/:id/status', paymentController.updateTransactionStatus);
router.post('/:id/refund', paymentController.refundTransaction);

export default router;
