import api from '../lib/api';

export const adminService = {
    async getDashboardStats() {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    async getAllPatients(query?: string) {
        const response = await api.get('/admin/patients', { params: { query } });
        return response.data;
    },

    async getAllDoctors() {
        // New method to fetch doctors via API
        const response = await api.get('/admin/doctors');
        return response.data;
    },

    async createPatient(data: any) {
        const response = await api.post('/admin/patients', data);
        return response.data;
    },

    async createUser(data: any) {
        const response = await api.post('/admin/users', data);
        return response.data;
    },

    async getAllUsers(role?: string) {
        const response = await api.get('/admin/users', { params: { role } });
        return response.data;
    },

    async updatePatient(id: string, data: any) {
        const response = await api.put(`/admin/patients/${id}`, data);
        return response.data;
    },

    async deletePatient(id: string) {
        const response = await api.delete(`/admin/patients/${id}`);
        return response.data;
    }
};
