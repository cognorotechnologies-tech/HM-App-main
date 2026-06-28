import { Request, Response } from 'express';
import { ShiftService } from '../../services/pharmacy/shiftService';

export const shiftController = {
    async openShift(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user?.id;
            const { openingCash } = req.body;

            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const shift = await ShiftService.openShift(userId, parseFloat(openingCash));
            res.status(201).json(shift);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async closeShift(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user?.id;
            const { closingCash } = req.body;

            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const shift = await ShiftService.closeShift(userId, parseFloat(closingCash));
            res.json(shift);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async getCurrentShift(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const shift = await ShiftService.getCurrentShift(userId);
            res.json(shift);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async getShiftHistory(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;
            const shifts = await ShiftService.listShifts(limit, offset);
            res.json(shifts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
};
