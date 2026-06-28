import { Request, Response } from 'express';
import { PatientService } from '../services/patientService';

export const getById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const patient = await PatientService.getPatientById(id);

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        console.error('Error in getById:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createPatient = async (req: Request, res: Response) => {
    try {
        const patientData = req.body;
        const newPatient = await PatientService.createPatient(patientData);
        res.status(201).json(newPatient);
    } catch (error) {
        console.error('Error in createPatient:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePatient = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const updates = req.body;
        const updatedPatient = await PatientService.updatePatient(id, updates);
        res.json(updatedPatient);
    } catch (error) {
        console.error('Error in updatePatient:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const getPatients = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        const patients = await PatientService.getAllPatients({ query: query as string });
        res.json(patients);
    } catch (error) {
        console.error('Error in getPatients:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
