import express from 'express';
import * as billingController from '../controllers/billingController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // All billing routes require auth

router.get('/', billingController.getAllInvoices);
router.get('/:id', billingController.getInvoiceById);
router.post('/', billingController.createInvoice);
router.put('/:id', billingController.updateInvoice);
router.delete('/:id', billingController.deleteInvoice);

export default router;
