
import { Request, Response } from 'express';
import { SurveyService } from '../services/surveyService';

// Templates
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await SurveyService.getTemplates(req.query);
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const template = await SurveyService.getTemplateById(req.params.id as string);
        if (!template) return res.status(404).json({ error: 'Template not found' });
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const data = { ...req.body, created_by: (req as any).user?.id };
        const template = await SurveyService.createTemplate(data);
        res.status(201).json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const template = await SurveyService.updateTemplate(req.params.id as string, req.body);
        if (!template) return res.status(404).json({ error: 'Template not found' });
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        await SurveyService.deleteTemplate(req.params.id as string);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


// Instances
export const getInstances = async (req: Request, res: Response) => {
    try {
        const instances = await SurveyService.getInstances(req.query);
        res.json(instances);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getInstanceById = async (req: Request, res: Response) => {
    try {
        const instance = await SurveyService.getInstanceById(req.params.id as string);
        if (!instance) return res.status(404).json({ error: 'Instance not found' });
        res.json(instance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createInstance = async (req: Request, res: Response) => {
    try {
        const instance = await SurveyService.createInstance(req.body);
        res.status(201).json(instance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const submitResponse = async (req: Request, res: Response) => {
    try {
        await SurveyService.submitResponse(req.params.id as string, req.body.responses); // expects { responses: [] }
        res.status(200).json({ message: 'Survey submitted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await SurveyService.getStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAlertsCount = async (req: Request, res: Response) => {
    try {
        const status = req.query.status as string;
        const count = await SurveyService.getAlertsCount(status);
        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
