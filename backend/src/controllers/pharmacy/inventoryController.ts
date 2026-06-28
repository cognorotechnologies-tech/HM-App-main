import { Request, Response } from 'express';
import { InventoryService } from '../../services/pharmacy/inventoryService';

export const addStock = async (req: Request, res: Response) => {
    try {
        const stock = await InventoryService.addStock(req.body);
        res.status(201).json(stock);
    } catch (error) {
        console.error('Error adding stock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getStockList = async (req: Request, res: Response) => {
    try {
        const { medicine_id } = req.query;
        const stock = await InventoryService.getStockList(medicine_id as string);
        res.json(stock);
    } catch (error) {
        console.error('Error fetching stock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getExpiringStock = async (req: Request, res: Response) => {
    try {
        const { days } = req.query;
        const stock = await InventoryService.getExpiringStock(days ? parseInt(days as string) : 30);
        res.json(stock);
    } catch (error) {
        console.error('Error fetching expiring stock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLowStock = async (req: Request, res: Response) => {
    try {
        const stock = await InventoryService.getLowStock();
        res.json(stock);
    } catch (error) {
        console.error('Error fetching low stock:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
