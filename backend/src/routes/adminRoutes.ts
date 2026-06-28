import { Router } from 'express';
import * as AdminController from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(authenticateToken);

// Dashboard
router.get('/stats', AdminController.getStats);

// Users
router.post('/users', AdminController.createUser);
router.get('/users', AdminController.getUsers);
router.get('/users/search', AdminController.searchUsers);
router.get('/patients', AdminController.getPatients);
router.post('/patients', AdminController.createPatient);
router.put('/patients/:id', AdminController.updatePatient);
router.delete('/patients/:id', AdminController.deletePatient);

router.get('/doctors', AdminController.getDoctors);
router.get('/doctors/pending', AdminController.getPendingDoctors);
router.post('/doctors', AdminController.createDoctor);
router.put('/doctors/:id', AdminController.updateDoctor);
router.delete('/doctors/:id', AdminController.deleteDoctor);


export default router;
