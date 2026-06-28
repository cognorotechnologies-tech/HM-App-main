import { Request, Response } from 'express';
import { SupplierService } from '../../services/pharmacy/supplierService';

export const createSupplier = async (req: Request, res: Response) => {
    try {
        const supplier = await SupplierService.create(req.body);
        res.status(201).json(supplier);
    } catch (error: any) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const updateSupplier = async (req: Request, res: Response) => {
    try {
        const supplier = await SupplierService.update(req.params.id as string, req.body);
        if (!supplier) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        res.json(supplier);
    } catch (error: any) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const listSuppliers = async (req: Request, res: Response) => {
    try {
        const { search, limit, offset } = req.query;
        const suppliers = await SupplierService.list({
            search: search as string,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        });
        res.json(suppliers);
    } catch (error: any) {
        console.error('Error listing suppliers:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getSupplierById = async (req: Request, res: Response) => {
    try {
        const supplier = await SupplierService.getById(req.params.id as string);
        if (!supplier) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        res.json(supplier);
    } catch (error: any) {
        console.error('Error getting supplier:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const deleteSupplier = async (req: Request, res: Response) => {
    try {
        const supplier = await SupplierService.delete(req.params.id as string);
        if (!supplier) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
