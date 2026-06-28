
import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflowService';

// Templates
export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await WorkflowService.getTemplates(req.query);
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const template = await WorkflowService.getTemplateById(req.params.id as string);
        if (!template) return res.status(404).json({ error: 'Template not found' });
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const data = { ...req.body, created_by: (req as any).user?.id };
        const template = await WorkflowService.createTemplate(data);
        res.status(201).json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const template = await WorkflowService.updateTemplate(req.params.id as string, req.body);
        if (!template) return res.status(404).json({ error: 'Template not found' });
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const success = await WorkflowService.deleteTemplate(req.params.id as string);
        if (!success) return res.status(404).json({ error: 'Template not found' });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const addStep = async (req: Request, res: Response) => {
    try {
        const step = await WorkflowService.addStep(req.params.id as string, req.body);
        res.status(201).json(step);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Instances
export const getInstances = async (req: Request, res: Response) => {
    try {
        const instances = await WorkflowService.getInstances(req.query);
        res.json(instances);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getInstanceById = async (req: Request, res: Response) => {
    try {
        const instance = await WorkflowService.getInstanceById(req.params.id as string);
        if (!instance) return res.status(404).json({ error: 'Instance not found' });
        res.json(instance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createInstance = async (req: Request, res: Response) => {
    try {
        const instance = await WorkflowService.createInstance(req.body);
        res.status(201).json(instance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
