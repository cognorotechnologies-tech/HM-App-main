/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../lib/axios';

export interface FamilyMember {
    id: string;
    patient_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    relationship: string;
    created_at: string;
    updated_at: string;
}

export type NewFamilyMember = Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>;

export const familyService = {
    async getMembers(patientId: string) {
        const { data } = await api.get<FamilyMember[]>('/family-members', {
            params: { patient_id: patientId }
        });
        return data;
    },

    async addMember(member: {
        patient_id: string;
        first_name: string;
        last_name: string;
        date_of_birth?: string;
        gender?: string;
        relationship: string;
        can_book_appointments?: boolean;
        can_view_medical_history?: boolean;
        can_view_prescriptions?: boolean;
    }) {
        const { data } = await api.post<FamilyMember>('/family-members', member);
        return data;
    },

    async updateMember(id: string, member: Partial<FamilyMember>) {
        const { data } = await api.put<FamilyMember>(`/family-members/${id}`, member);
        return data;
    },

    // Alias for compatibility
    async updatePermissions(id: string, permissions: any) {
        console.warn('Permissions update not yet implemented on backend');
        return null;
    },

    // Alias to match existing usage
    async removeMember(id: string) {
        await api.delete(`/family-members/${id}`);
    },

    async deleteMember(id: string) {
        await api.delete(`/family-members/${id}`);
    }
};
