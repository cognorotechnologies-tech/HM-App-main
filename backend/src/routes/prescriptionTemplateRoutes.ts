
import express from 'express';
import * as templateController from '../controllers/prescriptionTemplateController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', templateController.getAllTemplates);
router.get('/most-used', templateController.getMostUsedTemplates);
router.get('/:id', templateController.getTemplateById);
router.post('/', templateController.createTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.post('/:id/increment-use', templateController.incrementUseCount);
// Deactivate is soft delete, mapping to delete for now or separate depending on service implementation
router.patch('/:id/deactivate', templateController.deleteTemplate);

export default router;
