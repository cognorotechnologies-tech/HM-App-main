
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../lib/axios';

export interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    blood_group: string;
    address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    allergies: string[];
    chronic_conditions: string[];
    medical_history: string;
    current_medications: string;
    created_at: string;
    updated_at: string;
}

export const patientService = {
    async getAll() {
        const { data } = await api.get<Patient[]>('/patients');
        return data;
    },

    async getById(id: string) {
        try {
            const { data } = await api.get<Patient>(`/patients/${id}`);
            return data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    // Add other methods as needed
    async create(patient: Partial<Patient>) {
        const { data } = await api.post<Patient>('/patients', patient);
        return data;
    },

    async update(id: string, updates: Partial<Patient>) {
        const { data } = await api.put<Patient>(`/patients/${id}`, updates);
        return data;
    },

    async searchByEmail(email: string) {
        // Using admin endpoint for user search, assuming it returns profile data including role and id
        const { data } = await api.get<any[]>(`/admin/users/search`, {
            params: { query: email }
        });
        return data;
    },

    async search(query: string) {
        // Backend supports filtering on getAll via query param
        const { data } = await api.get<Patient[]>('/patients', {
            params: { query }
        });
        return data;
    }
};
