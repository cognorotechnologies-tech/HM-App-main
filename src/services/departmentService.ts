import api from '../lib/axios';

export interface Department {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

export type NewDepartment = Omit<Department, 'id' | 'created_at'>;

export const departmentService = {
    async getAll() {
        const { data } = await api.get<Department[]>('/departments');
        return data;
    },

    async getActive() {
        // We use the specific endpoint for active if it exists, or just all for now based on backend imp
        const { data } = await api.get<Department[]>('/departments/active');
        return data;
    },

    async create(department: { name: string; description?: string }) {
        const { data } = await api.post<Department>('/departments', department);
        return data;
    },

    async update(id: string, department: { name: string; description?: string }) {
        const { data } = await api.put<Department>(`/departments/${id}`, department);
        return data;
    },

    async delete(id: string) {
        await api.delete(`/departments/${id}`);
    }
};
