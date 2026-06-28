import { Request, Response } from 'express';
import { AppointmentModificationService } from '../services/appointmentModificationService';

export const getModificationsByAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentId = req.query.appointment_id as string;
        if (!appointmentId) {
            return res.status(400).json({ error: 'Appointment ID is required' });
        }
        const modifications = await AppointmentModificationService.getByAppointment(appointmentId);
        res.json(modifications);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createModification = async (req: Request, res: Response) => {
    try {
        const modification = await AppointmentModificationService.create(req.body);
        res.status(201).json(modification);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const rescheduleAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentId = req.params.id as string;
        const modification = await AppointmentModificationService.reschedule(appointmentId, req.body);
        res.json(modification);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const cancelAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentId = req.params.id as string;
        const modification = await AppointmentModificationService.cancel(appointmentId, req.body);
        res.json(modification);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
