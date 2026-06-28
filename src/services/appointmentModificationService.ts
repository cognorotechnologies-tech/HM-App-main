import api from '../lib/axios';

export interface AppointmentModification {
    id: string;
    appointment_id: string;
    modification_type: string;
    old_date: string | null;
    old_start_time: string | null;
    old_end_time: string | null;
    new_date: string | null;
    new_start_time: string | null;
    new_end_time: string | null;
    reason: string | null;
    modified_by: string | null;
    created_at: string;
}

export const appointmentModificationService = {
    async getByAppointment(appointmentId: string) {
        const { data } = await api.get<AppointmentModification[]>('/appointment-modifications', {
            params: { appointment_id: appointmentId }
        });
        return data;
    },

    async create(modification: {
        appointment_id: string;
        modification_type: string;
        old_date?: string;
        old_start_time?: string;
        old_end_time?: string;
        new_date?: string;
        new_start_time?: string;
        new_end_time?: string;
        reason?: string;
        modified_by?: string;
    }) {
        const { data } = await api.post<AppointmentModification>('/appointment-modifications', modification);
        return data;
    },

    async reschedule(appointmentId: string, rescheduleData: {
        old_date: string;
        old_start_time: string;
        old_end_time: string;
        new_date: string;
        new_start_time: string;
        new_end_time: string;
        reason?: string;
        modified_by?: string;
    }) {
        const { data } = await api.post<AppointmentModification>(
            `/appointment-modifications/${appointmentId}/reschedule`,
            rescheduleData
        );
        return data;
    },

    async cancel(appointmentId: string, cancelData: {
        reason?: string;
        modified_by?: string;
    }) {
        const { data } = await api.post<AppointmentModification>(
            `/appointment-modifications/${appointmentId}/cancel`,
            cancelData
        );
        return data;
    }
};
