import { Request, Response } from 'express';
import { AnalyticsService } from '../../services/pharmacy/analyticsService';

export const analyticsController = {
    async getDailySales(req: Request, res: Response) {
        try {
            const date = req.query.date as string || new Date().toISOString().split('T')[0];
            const data = await AnalyticsService.getDailySales(date);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async getTopMedicines(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 5;
            const data = await AnalyticsService.getTopMedicines(limit);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async getStockValuation(req: Request, res: Response) {
        try {
            const data = await AnalyticsService.getStockValuation();
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
};
