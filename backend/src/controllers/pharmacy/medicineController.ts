import { Request, Response } from 'express';
import { MedicineService } from '../../services/pharmacy/medicineService';

export const createMedicine = async (req: Request, res: Response) => {
    try {
        const medicine = await MedicineService.create(req.body);
        res.status(201).json(medicine);
    } catch (error) {
        console.error('Error creating medicine:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateMedicine = async (req: Request, res: Response) => {
    try {
        const medicine = await MedicineService.update(req.params.id as string, req.body);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
        res.json(medicine);
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMedicineById = async (req: Request, res: Response) => {
    try {
        const medicine = await MedicineService.getById(req.params.id as string);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
        res.json(medicine);
    } catch (error) {
        console.error('Error fetching medicine:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const listMedicines = async (req: Request, res: Response) => {
    try {
        const { search, category_id, limit, offset } = req.query;
        const medicines = await MedicineService.list({
            search: search as string,
            category_id: category_id as string,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        });
        res.json(medicines);
    } catch (error) {
        console.error('Error listing medicines:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteMedicine = async (req: Request, res: Response) => {
    try {
        const medicine = await MedicineService.delete(req.params.id as string);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
        res.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
