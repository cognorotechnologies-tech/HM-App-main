
import { Request, Response } from 'express';
import { TrackingService } from '../services/trackingService';

export const trackAction = async (req: Request, res: Response) => {
    try {
        const data = {
            ...req.body,
            user_agent: req.headers['user-agent'],
            ip_address: req.ip || req.socket.remoteAddress
        };
        // If user is authenticated, we might have their ID in req.user
        // But tracking often happens anonymously or explicitly passes patient_id
        if ((req as any).user && (req as any).user.id) {
            // If request body doesn't specify patient_id, try to use auth user if role is patient
            if (!data.patient_id && (req as any).user.role === 'patient') {
                data.patient_id = (req as any).user.id;
            }
        }

        const result = await TrackingService.trackAction(data);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getActions = async (req: Request, res: Response) => {
    try {
        const actions = await TrackingService.getActions(req.query);
        res.json(actions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await TrackingService.getStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
