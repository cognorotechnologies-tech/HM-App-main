import { Request, Response } from 'express';
import { FamilyService } from '../services/familyService';

export const getFamilyMembers = async (req: Request, res: Response) => {
    try {
        // Assuming patient_id comes from query param or derived from auth user if it's a patient
        const patientId = req.query.patient_id as string;

        if (!patientId) {
            return res.status(400).json({ error: 'Patient ID is required' });
        }

        const members = await FamilyService.getByPatientId(patientId);
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const addFamilyMember = async (req: Request, res: Response) => {
    try {
        const member = await FamilyService.addMember(req.body);
        res.status(201).json(member);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateFamilyMember = async (req: Request, res: Response) => {
    try {
        const member = await FamilyService.updateMember(req.params.id as string, req.body);
        if (!member) {
            return res.status(404).json({ error: 'Family member not found' });
        }
        res.json(member);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteFamilyMember = async (req: Request, res: Response) => {
    try {
        const member = await FamilyService.deleteMember(req.params.id as string);
        if (!member) {
            return res.status(404).json({ error: 'Family member not found' });
        }
        res.json({ message: 'Family member deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
