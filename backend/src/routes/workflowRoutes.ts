
import { Router } from 'express';
import * as WorkflowController from '../controllers/workflowController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Templates
router.get('/templates', WorkflowController.getTemplates);
router.post('/templates', WorkflowController.createTemplate);
router.get('/templates/:id', WorkflowController.getTemplateById);
router.put('/templates/:id', WorkflowController.updateTemplate);
router.delete('/templates/:id', WorkflowController.deleteTemplate);
router.post('/templates/:id/steps', WorkflowController.addStep);

// Instances
router.get('/instances', WorkflowController.getInstances);
router.post('/instances', WorkflowController.createInstance);
router.get('/instances/:id', WorkflowController.getInstanceById);

export default router;
