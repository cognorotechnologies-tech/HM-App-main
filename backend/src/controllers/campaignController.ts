
import { Request, Response } from 'express';
import { CampaignService } from '../services/campaignService';

// Campaigns
export const getCampaigns = async (req: Request, res: Response) => {
    try {
        const campaigns = await CampaignService.getCampaigns(req.query);
        res.json(campaigns);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCampaignById = async (req: Request, res: Response) => {
    try {
        const campaign = await CampaignService.getCampaignById(req.params.id as string);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        res.json(campaign);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createCampaign = async (req: Request, res: Response) => {
    try {
        // Assume req.user.id is available from auth middleware
        const data = { ...req.body, created_by: (req as any).user?.id };
        const campaign = await CampaignService.createCampaign(data);
        res.status(201).json(campaign);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateCampaign = async (req: Request, res: Response) => {
    try {
        const campaign = await CampaignService.updateCampaign(req.params.id as string, req.body);
        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
        res.json(campaign);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCampaign = async (req: Request, res: Response) => {
    try {
        await CampaignService.deleteCampaign(req.params.id as string);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCampaignStats = async (req: Request, res: Response) => {
    try {
        const stats = await CampaignService.getCampaignStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Templates
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await CampaignService.getTemplates(req.query.channel as string);
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const template = await CampaignService.getTemplateById(req.params.id as string);
        if (!template) return res.status(404).json({ error: 'Template not found' });
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Recipients
export const getRecipients = async (req: Request, res: Response) => {
    try {
        const recipients = await CampaignService.getRecipients(req.params.id as string);
        res.json(recipients);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
