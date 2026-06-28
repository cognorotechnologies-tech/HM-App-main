import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointmentService';

export const getAll = async (req: Request, res: Response) => {
    try {
        const { patient_id, doctor_id, status, date_from, date_to } = req.query;
        const appointments = await AppointmentService.getAll({
            patient_id: patient_id as string,
            doctor_id: doctor_id as string,
            status: status as string,
            date_from: date_from as string,
            date_to: date_to as string
        });
        res.json(appointments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const appointment = await AppointmentService.getById(req.params.id as string);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getByPatient = async (req: Request, res: Response) => {
    try {
        const { patient_id } = req.query;
        if (!patient_id) {
            return res.status(400).json({ error: 'patient_id is required' });
        }
        const appointments = await AppointmentService.getByPatient(patient_id as string);
        res.json(appointments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getByDoctor = async (req: Request, res: Response) => {
    try {
        const { doctor_id } = req.query;
        if (!doctor_id) {
            return res.status(400).json({ error: 'doctor_id is required' });
        }
        const appointments = await AppointmentService.getByDoctor(doctor_id as string);
        res.json(appointments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const checkAvailability = async (req: Request, res: Response) => {
    try {
        const { doctor_id, appointment_date, start_time, end_time, exclude_appointment_id } = req.query;
        if (!doctor_id || !appointment_date || !start_time || !end_time) {
            return res.status(400).json({ error: 'doctor_id, appointment_date, start_time, and end_time are required' });
        }
        const isAvailable = await AppointmentService.checkAvailability(
            doctor_id as string,
            appointment_date as string,
            start_time as string,
            end_time as string,
            exclude_appointment_id as string
        );
        res.json({ available: isAvailable });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const appointment = await AppointmentService.create(req.body);
        res.status(201).json(appointment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'status is required' });
        }
        const appointment = await AppointmentService.updateStatus(req.params.id as string, status);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const appointment = await AppointmentService.update(req.params.id as string, req.body);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const appointment = await AppointmentService.delete(req.params.id as string);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
