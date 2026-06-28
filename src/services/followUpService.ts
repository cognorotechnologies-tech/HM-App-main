import api from '../lib/axios';

export interface FollowUp {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_id?: string;
    follow_up_date: string;
    reason: string;
    status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
    is_notified: boolean;
    // Joined fields
    first_name?: string;
    last_name?: string;
}

export const followUpService = {
    async create(data: Partial<FollowUp>) {
        const response = await api.post<FollowUp>('/follow-ups', data);
        return response.data;
    },

    async getUpcoming(doctorId: string) {
        const response = await api.get<FollowUp[]>(`/follow-ups/doctor/${doctorId}/upcoming`);
        return response.data;
    },

    async getByPatient(patientId: string) {
        const response = await api.get<FollowUp[]>(`/follow-ups/patient/${patientId}`);
        return response.data;
    },

    async markStatus(id: string, status: string) {
        const response = await api.patch<FollowUp>(`/follow-ups/${id}/status`, { status });
        return response.data;
    }
};
