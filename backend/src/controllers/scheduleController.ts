import { Request, Response } from 'express';
import { ScheduleService } from '../services/scheduleService';

export const getByDoctor = async (req: Request, res: Response) => {
    try {
        const { doctor_id } = req.query;
        if (!doctor_id) {
            return res.status(400).json({ error: 'doctor_id is required' });
        }
        const schedules = await ScheduleService.getByDoctor(doctor_id as string);
        res.json(schedules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const schedule = await ScheduleService.create(req.body);
        res.status(201).json(schedule);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteSchedule = async (req: Request, res: Response) => {
    try {
        const schedule = await ScheduleService.delete(req.params.id as string);
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
