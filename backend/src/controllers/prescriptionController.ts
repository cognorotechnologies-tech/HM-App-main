import { Request, Response } from 'express';
import { PrescriptionService } from '../services/prescriptionService';

export const getAllPrescriptions = async (req: Request, res: Response) => {
    try {
        const prescriptions = await PrescriptionService.getAll();
        res.json(prescriptions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
    try {
        const prescription = await PrescriptionService.getById(req.params.id as string);
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        res.json(prescription);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPrescriptionsByPatient = async (req: Request, res: Response) => {
    try {
        const patientId = req.query.patient_id as string;
        if (!patientId) {
            return res.status(400).json({ error: 'Patient ID is required' });
        }
        const prescriptions = await PrescriptionService.getByPatient(patientId);
        res.json(prescriptions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPrescriptionsByAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentId = req.query.appointment_id as string;
        if (!appointmentId) {
            return res.status(400).json({ error: 'Appointment ID is required' });
        }
        const prescriptions = await PrescriptionService.getByAppointment(appointmentId);
        res.json(prescriptions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createPrescription = async (req: Request, res: Response) => {
    try {
        const prescription = await PrescriptionService.create(req.body);
        res.status(201).json(prescription);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePrescription = async (req: Request, res: Response) => {
    try {
        const prescription = await PrescriptionService.update(req.params.id as string, req.body);
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        res.json(prescription);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePrescription = async (req: Request, res: Response) => {
    try {
        const prescription = await PrescriptionService.delete(req.params.id as string);
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        res.json({ message: 'Prescription deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
