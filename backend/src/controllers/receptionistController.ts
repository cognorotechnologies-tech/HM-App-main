import { Request, Response } from 'express';
import { ReceptionistService } from '../services/receptionistService';



export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await ReceptionistService.getDashboardStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const registerPatient = async (req: Request, res: Response) => {
    try {
        const result = await ReceptionistService.registerPatient({
            ...req.body,
            visit: {
                ...req.body.visit,
                createdBy: (req as any).user.userId
            }
        });
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Registration failed:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getQueue = async (req: Request, res: Response) => {
    try {
        const { department_id, doctor_id } = req.query;
        const queue = await ReceptionistService.getQueue(department_id as string, doctor_id as string);
        res.json(queue);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;
        const updated = await ReceptionistService.updateVisitStatus(id, status);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createVisit = async (req: Request, res: Response) => {
    try {
        const result = await ReceptionistService.createVisit({
            ...req.body,
            createdBy: (req as any).user.userId
        });
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
