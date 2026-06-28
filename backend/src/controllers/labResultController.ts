import { Request, Response } from 'express';
import { labResultService } from '../services/labResultService';
import { analyzeLabReport } from '../services/aiService';

export class LabResultController {
    async create(req: Request, res: Response) {
        try {
            const result = await labResultService.create(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating lab result:', error);
            res.status(500).json({ error: 'Failed to create lab result' });
        }
    }

    async getByPatient(req: Request, res: Response) {
        try {
            const { patientId } = req.params;
            const results = await labResultService.getByPatient(patientId as string);
            res.json(results);
        } catch (error) {
            console.error('Error fetching lab results:', error);
            res.status(500).json({ error: 'Failed to fetch lab results' });
        }
    }

    // Placeholder for upload behavior 
    // In a real scenario, this would handle Multipart file upload, parse it, send to AI, then save result
    async uploadAndAnalyze(req: Request, res: Response) {
        try {
            // For now, we expect the frontend to have already "analyzed" or just sending JSON data
            // If we want backend analysis, we'd need multer here. 
            // Let's assume frontend sends the analyzed JSON for now to keep it simple, 
            // OR simply saves the result of the frontend AI call.

            const result = await labResultService.create({
                ...req.body,
                status: 'available',
                test_date: new Date()
            });
            res.status(201).json(result);
        } catch (error) {
            console.error('Error processing lab result:', error);
            res.status(500).json({ error: 'Failed to process lab result' });
        }
    }
}

export const labResultController = new LabResultController();
