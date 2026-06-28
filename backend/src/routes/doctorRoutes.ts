import { Router } from 'express';
import * as AdminController from '../controllers/adminController';

const router = Router();

// Public route to list doctors
router.get('/', AdminController.getDoctors);
router.get('/:id', AdminController.getDoctorById);
router.get('/:id/dashboard-stats', AdminController.getDoctorDashboardStats);

export default router;
