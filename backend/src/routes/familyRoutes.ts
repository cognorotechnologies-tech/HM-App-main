import express from 'express';
import * as familyController from '../controllers/familyController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // All family routes require auth

router.get('/', familyController.getFamilyMembers);
router.post('/', familyController.addFamilyMember);
router.put('/:id', familyController.updateFamilyMember);
router.delete('/:id', familyController.deleteFamilyMember);

export default router;
