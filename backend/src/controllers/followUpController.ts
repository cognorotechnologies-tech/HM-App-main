import { Request, Response } from 'express';
import { followUpService } from '../services/followUpService';

export class FollowUpController {
    async create(req: Request, res: Response) {
        try {
            const data = req.body;
            const result = await followUpService.create(data);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error scheduling follow-up:', error);
            res.status(500).json({ error: 'Failed to schedule follow-up' });
        }
    }

    async getUpcoming(req: Request, res: Response) {
        try {
            const { doctorId } = req.params;
            const results = await followUpService.getUpcoming(doctorId as string);
            res.json(results);
        } catch (error) {
            console.error('Error fetching upcoming follow-ups:', error);
            res.status(500).json({ error: 'Failed to fetch upcoming follow-ups' });
        }
    }

    async getByPatient(req: Request, res: Response) {
        try {
            const { patientId } = req.params;
            const results = await followUpService.getByPatient(patientId as string);
            res.json(results);
        } catch (error) {
            console.error('Error fetching patient follow-ups:', error);
            res.status(500).json({ error: 'Failed to fetch patient follow-ups' });
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await followUpService.markStatus(id as string, status);
            res.json(result);
        } catch (error) {
            console.error('Error updating follow-up status:', error);
            res.status(500).json({ error: 'Failed to update follow-up status' });
        }
    }
}

export const followUpController = new FollowUpController();
