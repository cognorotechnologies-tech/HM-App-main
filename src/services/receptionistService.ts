
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../lib/api';

export const receptionistService = {
    async registerPatient(data: any) {
        const response = await api.post('/receptionist/register', data);
        return response.data;
    },

    async getQueue(departmentId?: string) {
        const response = await api.get('/receptionist/queue', {
            params: { departmentId }
        });
        return response.data;
    },

    async createVisit(data: any) {
        const response = await api.post('/receptionist/visits', data);
        return response.data;
    },

    async updateVisitStatus(id: string, status: string) {
        const response = await api.put(`/receptionist/visits/${id}/status`, { status });
        return response.data;
    },

    async getDashboardStats() {
        const response = await api.get('/receptionist/stats');
        return response.data;
    }
};
