
import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';

export const getTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await TaskService.getTasks(req.query);
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const task = await TaskService.getTaskById(req.params.id as string);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const task = await TaskService.createTask(req.body);
        res.status(201).json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const task = await TaskService.updateTask(req.params.id as string, req.body);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        await TaskService.deleteTask(req.params.id as string);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await TaskService.getStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
