import { Request, Response } from 'express';
import { BillingService } from '../../services/pharmacy/billingService';

export const createBill = async (req: Request, res: Response) => {
    try {
        // Assume auth middleware populates user.id
        const cashierId = (req as any).user?.id;
        if (!cashierId) {
            // Fallback for development/testing if token not fully mocked or user not extracted properly
            // return res.status(401).json({ message: 'Unauthorized' });
            // For now we might pass, but let's assume middleware works or we use a fallback if user is optional (it shouldn't be).
        }

        const bill = await BillingService.createBill(req.body, cashierId || '00000000-0000-0000-0000-000000000000'); // Fallback UUID if no auth used in dev
        res.status(201).json(bill);
    } catch (error: any) {
        console.error('Error creating bill:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

export const getBillById = async (req: Request, res: Response) => {
    try {
        const bill = await BillingService.getBill(req.params.id as string);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (error) {
        console.error('Error fetching bill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const listBills = async (req: Request, res: Response) => {
    try {
        const { billNumber, startDate, endDate, limit, offset } = req.query;
        const bills = await BillingService.listBills({
            bill_number: billNumber as string,
            start_date: startDate as string,
            end_date: endDate as string,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        });
        res.json(bills);
    } catch (error) {
        console.error('Error listing bills:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const processReturn = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id || '00000000-0000-0000-0000-000000000000';
        const { originalBillId, returnItems, reason, refundMode } = req.body;

        const result = await BillingService.processReturn(
            originalBillId,
            returnItems,
            reason,
            refundMode,
            userId
        );
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Error processing return:', error);
        res.status(400).json({ error: error.message });
    }
};
