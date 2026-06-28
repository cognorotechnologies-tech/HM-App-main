
import { Router } from 'express';
import * as SurveyController from '../controllers/surveyController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Stats
router.get('/stats', SurveyController.getStats);
router.get('/alerts/count', SurveyController.getAlertsCount);

// Templates
router.get('/templates', SurveyController.getTemplates);
router.post('/templates', SurveyController.createTemplate);
router.get('/templates/:id', SurveyController.getTemplateById);
router.put('/templates/:id', SurveyController.updateTemplate);
router.delete('/templates/:id', SurveyController.deleteTemplate);

// Instances
router.get('/instances', SurveyController.getInstances);
router.post('/instances', SurveyController.createInstance);
router.get('/instances/:id', SurveyController.getInstanceById);
router.post('/instances/:id/submit', SurveyController.submitResponse);

export default router;
