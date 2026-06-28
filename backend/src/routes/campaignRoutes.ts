
import { Router } from 'express';
import * as CampaignController from '../controllers/campaignController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Stats (must be before :id)
router.get('/stats', CampaignController.getCampaignStats);

// Templates
router.get('/templates', CampaignController.getTemplates);
router.get('/templates/:id', CampaignController.getTemplateById);

// Campaigns
router.get('/', CampaignController.getCampaigns);
router.post('/', CampaignController.createCampaign);
router.get('/:id', CampaignController.getCampaignById);
router.put('/:id', CampaignController.updateCampaign);
router.delete('/:id', CampaignController.deleteCampaign);

// Recipients
router.get('/:id/recipients', CampaignController.getRecipients);

export default router;
