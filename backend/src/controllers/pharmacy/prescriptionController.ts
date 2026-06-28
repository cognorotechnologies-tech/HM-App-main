import { Request, Response } from 'express';
import { PharmacyPrescriptionService } from '../../services/pharmacy/pharmacyPrescriptionService';

export const listPendingPrescriptions = async (req: Request, res: Response) => {
    try {
        const prescriptions = await PharmacyPrescriptionService.getPending();
        res.json(prescriptions);
    } catch (error: any) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
    try {
        const prescription = await PharmacyPrescriptionService.getById(req.params.id as string);
        if (!prescription) {
            res.status(404).json({ message: 'Prescription not found' });
            return;
        }
        res.json(prescription);
    } catch (error: any) {
        console.error('Error getting prescription:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
