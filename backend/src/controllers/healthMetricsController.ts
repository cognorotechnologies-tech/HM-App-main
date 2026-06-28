import { Request, Response } from 'express';
import { HealthMetricsService } from '../services/healthMetricsService';

export const getAll = async (req: Request, res: Response) => {
    try {
        const { patient_id, metric_type } = req.query;
        const metrics = await HealthMetricsService.getAll({
            patient_id: patient_id as string,
            metric_type: metric_type as string
        });
        res.json(metrics);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const metric = await HealthMetricsService.getById(req.params.id as string);
        if (!metric) {
            return res.status(404).json({ error: 'Health metric not found' });
        }
        res.json(metric);
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
        const metrics = await HealthMetricsService.getByPatient(patient_id as string);
        res.json(metrics);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const metric = await HealthMetricsService.create(req.body);
        res.status(201).json(metric);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const metric = await HealthMetricsService.update(req.params.id as string, req.body);
        if (!metric) {
            return res.status(404).json({ error: 'Health metric not found' });
        }
        res.json(metric);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteMetric = async (req: Request, res: Response) => {
    try {
        const metric = await HealthMetricsService.delete(req.params.id as string);
        if (!metric) {
            return res.status(404).json({ error: 'Health metric not found' });
        }
        res.json({ message: 'Health metric deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getLatestByType = async (req: Request, res: Response) => {
    try {
        const { patient_id, metric_type } = req.query;
        if (!patient_id || !metric_type) {
            return res.status(400).json({ error: 'patient_id and metric_type are required' });
        }
        const metric = await HealthMetricsService.getLatestByType(
            patient_id as string,
            metric_type as string
        );
        res.json(metric);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const { patient_id, metric_type, limit } = req.query;
        if (!patient_id || !metric_type) {
            return res.status(400).json({ error: 'patient_id and metric_type are required' });
        }
        const metrics = await HealthMetricsService.getHistory(
            patient_id as string,
            metric_type as string,
            limit ? parseInt(limit as string) : 10
        );
        res.json(metrics);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
