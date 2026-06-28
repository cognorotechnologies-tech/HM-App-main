import express from 'express';
import * as departmentController from '../controllers/departmentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', departmentController.getDepartments); // Public or authenticated? usually public for dropdowns
router.get('/active', departmentController.getActiveDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', authenticateToken, departmentController.createDepartment);
router.put('/:id', authenticateToken, departmentController.updateDepartment);
router.delete('/:id', authenticateToken, departmentController.deleteDepartment);

export default router;
