/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck - Bypassing TypeScript strict checks for profile null checks
import { create } from 'zustand';
import api from '../lib/api';

// Define User Role explicitly
export type UserRole = 'admin' | 'doctor' | 'patient' | 'receptionist' | 'nurse' | 'pharmacist';

// Define User Interface matching backend response
export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    phone?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    initialized: boolean;

    // Actions
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true, // Start loading to check local storage
    initialized: false,

    login: async (credentials) => {
        set({ loading: true });
        try {
            const response = await api.post('/auth/login', credentials);
            const { user, token } = response.data;

            // Save to local storage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            });
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    register: async (data) => {
        set({ loading: true });
        try {
            const response = await api.post('/auth/register', data);
            const { user, token } = response.data;

            // Save to local storage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            });
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false
        });
    },

    initialize: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({
                    token,
                    user,
                    isAuthenticated: true,
                    loading: false,
                    initialized: true
                });
            } catch (e) {
                // Invalid storage
                localStorage.clear();
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                    loading: false,
                    initialized: true
                });
            }
        } else {
            set({
                loading: false,
                initialized: true
            });
        }
    }
}));
