import { Request, Response } from 'express';
import { DepartmentService } from '../services/departmentService';

export const getDepartments = async (req: Request, res: Response) => {
    try {
        const departments = await DepartmentService.getAll();
        res.json(departments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getActiveDepartments = async (req: Request, res: Response) => {
    try {
        const departments = await DepartmentService.getActive();
        res.json(departments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getDepartmentById = async (req: Request, res: Response) => {
    try {
        const department = await DepartmentService.getById(req.params.id as string);
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(department);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createDepartment = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const department = await DepartmentService.create(name, description);
        res.status(201).json(department);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const department = await DepartmentService.update(req.params.id as string, name, description);
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(department);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const department = await DepartmentService.delete(req.params.id as string);
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json({ message: 'Department deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
