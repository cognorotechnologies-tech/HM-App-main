import { Request, Response } from 'express';
import { GRNService } from '../../services/pharmacy/grnService';

export const createGRN = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const receivedBy = req.user?.id;
        const grn = await GRNService.create({ ...req.body, received_by: receivedBy });
        res.status(201).json(grn);
    } catch (error: any) {
        console.error('Error creating GRN:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
