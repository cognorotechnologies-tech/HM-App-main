import { Request, Response } from 'express';
import { transcriptService } from '../services/transcriptService';

export class TranscriptController {
    async save(req: Request, res: Response) {
        try {
            const data = req.body;
            // Ensure doctor ID matches authenticated user for security
            // data.doctor_id = (req as any).user.id; 
            const result = await transcriptService.save(data);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error saving transcript:', error);
            res.status(500).json({ error: 'Failed to save transcript' });
        }
    }

    async getByAppointment(req: Request, res: Response) {
        try {
            const { appointmentId } = req.params;
            const result = await transcriptService.getByAppointment(appointmentId as string);
            if (!result) {
                return res.status(404).json({ message: 'Transcript not found' });
            }
            res.json(result);
        } catch (error) {
            console.error('Error fetching transcript:', error);
            res.status(500).json({ error: 'Failed to fetch transcript' });
        }
    }
}

export const transcriptController = new TranscriptController();
