import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const result = await AuthService.registerUser(email, password, firstName, lastName, role);
        res.json(result);
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Missing email or password' });
            return;
        }

        const result = await AuthService.loginUser(email, password);
        res.json(result);
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(401).json({ error: error.message });
    }
};
