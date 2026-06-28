import { Request, Response } from 'express';
import { PurchaseOrderService } from '../../services/pharmacy/purchaseOrderService';

export const createPurchaseOrder = async (req: Request, res: Response) => {
    try {
        // @ts-ignore - User attached by auth middleware
        const createdBy = req.user?.id;
        const po = await PurchaseOrderService.create({ ...req.body, created_by: createdBy });
        res.status(201).json(po);
    } catch (error: any) {
        console.error('Error creating PO:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const listPurchaseOrders = async (req: Request, res: Response) => {
    try {
        const { status, search, limit, offset } = req.query;
        const orders = await PurchaseOrderService.list({
            status: status as string,
            search: search as string,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        });
        res.json(orders);
    } catch (error: any) {
        console.error('Error listing POs:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getPurchaseOrderById = async (req: Request, res: Response) => {
    try {
        const po = await PurchaseOrderService.getById(req.params.id as string);
        if (!po) {
            res.status(404).json({ message: 'Purchase Order not found' });
            return;
        }
        res.json(po);
    } catch (error: any) {
        console.error('Error getting PO:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const updatePOStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        // @ts-ignore
        const approvedBy = req.user?.id;

        const po = await PurchaseOrderService.updateStatus(req.params.id as string, status, approvedBy);
        if (!po) {
            res.status(404).json({ message: 'Purchase Order not found' });
            return;
        }
        res.json(po);
    } catch (error: any) {
        console.error('Error updating PO status:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
