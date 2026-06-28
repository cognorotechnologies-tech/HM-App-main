import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await AdminService.getDashboardStats();
        res.json(stats);
    } catch (error: any) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { role } = req.query;
        const users = await AdminService.getAllUsers({ role: role as string });
        res.json(users);
    } catch (error: any) {
        console.error('Get users error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const user = await AdminService.createUser(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        console.error('Create user error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getPatients = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        const patients = await AdminService.getAllPatients({ query: query as string });
        res.json(patients);
    } catch (error: any) {
        console.error('Get patients error:', error);
        res.status(500).json({ error: error.message });
    }
};

// --- PATIENTS ---

export const createPatient = async (req: Request, res: Response) => {
    try {
        const patient = await AdminService.createPatient(req.body);
        res.status(201).json(patient);
    } catch (error: any) {
        console.error('Create patient error:', error);
        res.status(500).json({ error: error.message });
    }
}

export const updatePatient = async (req: Request, res: Response) => {
    try {
        const patient = await AdminService.updatePatient(req.params.id as string, req.body);
        res.json(patient);
    } catch (error: any) {
        console.error('Update patient error:', error);
        res.status(500).json({ error: error.message });
    }
}

export const deletePatient = async (req: Request, res: Response) => {
    try {
        await AdminService.deletePatient(req.params.id as string);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Delete patient error:', error);
        res.status(500).json({ error: error.message });
    }
}

// --- DOCTORS ---

export const getDoctors = async (req: Request, res: Response) => {
    try {
        const { department_id, query } = req.query;
        const doctors = await AdminService.getAllDoctors({
            department_id: department_id as string,
            query: query as string
        });
        res.json(doctors);
    } catch (error: any) {
        console.error('Get doctors error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createDoctor = async (req: Request, res: Response) => {
    try {
        const doctor = await AdminService.createDoctor(req.body);
        res.status(201).json(doctor);
    } catch (error: any) {
        console.error('Create doctor error:', error);
        res.status(500).json({ error: error.message });
    }
}

export const updateDoctor = async (req: Request, res: Response) => {
    try {
        const doctor = await AdminService.updateDoctor(req.params.id as string, req.body);
        res.json(doctor);
    } catch (error: any) {
        console.error('Update doctor error:', error);
        res.status(500).json({ error: error.message });
    }
}

export const deleteDoctor = async (req: Request, res: Response) => {
    try {
        await AdminService.deleteDoctor(req.params.id as string);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Delete doctor error:', error);
        res.status(500).json({ error: error.message });
    }
}

export const getDoctorById = async (req: Request, res: Response) => {
    try {
        const doctor = await AdminService.getDoctorById(req.params.id as string);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (error: any) {
        console.error('Get doctor by id error:', error);
        res.status(500).json({ error: error.message });
    }
}

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const query = req.query.query as string;
        if (!query) return res.json([]);
        const users = await AdminService.searchUsers(query);
        res.json(users);
    } catch (error: any) {
        console.error('Search users error:', error);
        res.status(500).json({ error: error.message });
    }
}

export const getPendingDoctors = async (req: Request, res: Response) => {
    try {
        const pending = await AdminService.getPendingDoctors();
        res.json(pending);
    } catch (error: any) {
        console.error('Get pending doctors error:', error);
        res.status(500).json({ error: error.message });
    }
}

export const getDoctorDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await AdminService.getDoctorDashboardStats(req.params.id as string);
        res.json(stats);
    } catch (error: any) {
        console.error('Get doctor dashboard stats error:', error);
        res.status(500).json({ error: error.message });
    }
}
