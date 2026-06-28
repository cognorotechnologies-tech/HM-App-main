
import { Request, Response } from 'express';
import { PrescriptionTemplateService } from '../services/prescriptionTemplateService';

export const getAllTemplates = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const doctorId = user.doctor_id || user.id;
        const templates = await PrescriptionTemplateService.getAll(doctorId);
        res.json(templates);
    } catch (error: any) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getTemplateById = async (req: Request, res: Response) => {
    try {
        const template = await PrescriptionTemplateService.getById(req.params.id as string);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTemplate = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const doctorId = user.doctor_id || user.id;
        const template = await PrescriptionTemplateService.create({
            ...req.body,
            doctor_id: doctorId
        });
        res.status(201).json(template);
    } catch (error: any) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const doctorId = user.doctor_id || user.id;
        const template = await PrescriptionTemplateService.update(req.params.id as string, doctorId, req.body);
        if (!template) {
            return res.status(404).json({ error: 'Template not found or unauthorized' });
        }
        res.json(template);
    } catch (error: any) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const doctorId = user.doctor_id || user.id;
        const template = await PrescriptionTemplateService.delete(req.params.id as string, doctorId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found or unauthorized' });
        }
        res.json({ message: 'Template deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: error.message });
    }
};

export const incrementUseCount = async (req: Request, res: Response) => {
    try {
        await PrescriptionTemplateService.incrementUseCount(req.params.id as string);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMostUsedTemplates = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const doctorId = user.doctor_id || user.id;
        const limit = parseInt(req.query.limit as string) || 5;
        const templates = await PrescriptionTemplateService.getMostUsed(doctorId, limit);
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
