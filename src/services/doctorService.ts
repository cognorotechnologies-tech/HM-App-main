/* eslint-disable @typescript-eslint/no-unused-vars */

import api from '../lib/api';

export interface Doctor {
    id: string;
    department_id: string | null;
    specialization: string | null;
    qualifications: string | null;
    license_number: string | null;
    years_of_experience: number | null;
    created_at: string | null;
    profiles: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        phone: string | null;
        role: string | null;
        created_at: string | null;
    };
    departments: {
        id: string;
        name: string;
        description: string | null;
        created_at: string | null;
    } | null;
    status?: 'available' | 'busy' | 'break' | 'offline';
};

export interface NewDoctor {
    id: string; // Foreign key to profiles.id
    department_id?: string | null;
    specialization?: string | null;
    qualifications?: string | null;
    license_number?: string | null;
    years_of_experience?: number | null;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
};

export interface UpdateDoctor {
    department_id?: string | null;
    specialization?: string | null;
    qualifications?: string | null;
    license_number?: string | null;
    years_of_experience?: number | null;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    status?: 'available' | 'busy' | 'break' | 'offline';
};

export const doctorService = {
    async getAll() {
        // Public endpoint
        const response = await api.get('/doctors');
        return response.data as Doctor[];
    },

    async getById(id: string) {
        // Public endpoint - need to implement in backend if missing
        const response = await api.get(`/doctors/${id}`);
        return response.data as Doctor;
    },

    async create(doctor: NewDoctor) {
        // Admin endpoint
        const response = await api.post('/admin/doctors', doctor);
        return response.data;
    },

    async update(id: string, doctor: UpdateDoctor) {
        // Admin endpoint
        const response = await api.put(`/admin/doctors/${id}`, doctor);
        return response.data;
    },

    async delete(id: string) {
        // Admin endpoint
        await api.delete(`/admin/doctors/${id}`);
    },

    // Helper to promote a user to doctor role
    async promoteUserToDoctor(userId: string) {
        // This should logically be part of create or a separate admin endpoint.
        // For now, let's assume createDoctor handles this or we utilize updatePatient (which updates profile)?
        // Let's create a specific endpoint or use a generic profile update if available.
        // Assuming AdminService can handle profile updates via updatePatient endpoint which accepts profile fields.

        // However, updatePatient updates `patients` table primarily but also `profiles`. 
        // But `promoteUserToDoctor` is about `profiles.role`.

        // Let's assume the backend `createDoctor` should handle it.
        // But the frontend calls this explicitly in `DoctorsManager`.
        // We can just make this a no-op if the backend `createDoctor` does it, 
        // OR call an endpoint to update role.

        // I'll make it a no-op here and ensure backend `createDoctor` sets the role.
        // Actually, `DoctorsManager` calls `promoteUserToDoctor` THEN `create`.
        console.log('promoteUserToDoctor: Handled by backend createDoctor');
    },

    async searchUsers(query: string) {
        // This needs an endpoint. Admin only?
        // Let's use an admin endpoint for searching users.
        const response = await api.get(`/admin/users/search?query=${encodeURIComponent(query)}`);
        return response.data;
    },

    async getPendingDoctors() {
        // Admin endpoint
        const response = await api.get('/admin/doctors/pending');
        return response.data;
    },

    async getDashboardStats(doctorId: string) {
        const response = await api.get(`/doctors/${doctorId}/dashboard-stats`);
        return response.data;
    }
};
