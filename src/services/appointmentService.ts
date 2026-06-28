import api from '../lib/axios';

export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    department_id: string | null;
    appointment_date: string;
    start_time: string;
    end_time: string;
    appointment_type: string;
    status: string;
    reason: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface NewAppointment {
    patient_id: string;
    doctor_id: string;
    department_id?: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    appointment_type: string;
    status?: string;
    reason?: string;
    notes?: string;
}

export const appointmentService = {
    async getAll(filters?: { patient_id?: string; doctor_id?: string; status?: string; date_from?: string; date_to?: string }) {
        const { data } = await api.get<Appointment[]>('/appointments', { params: filters });
        return data;
    },

    async getById(id: string) {
        const { data } = await api.get<Appointment>(`/appointments/${id}`);
        return data;
    },

    async getByPatient(patientId: string) {
        const { data } = await api.get<Appointment[]>('/appointments/by-patient', {
            params: { patient_id: patientId }
        });
        return data;
    },

    async getByDoctor(doctorId: string) {
        const { data } = await api.get<Appointment[]>('/appointments/by-doctor', {
            params: { doctor_id: doctorId }
        });
        return data;
    },

    async checkAvailability(doctorId: string, appointmentDate: string, startTime: string, endTime: string, excludeAppointmentId?: string) {
        const { data } = await api.get<{ available: boolean }>('/appointments/check-availability', {
            params: {
                doctor_id: doctorId,
                appointment_date: appointmentDate,
                start_time: startTime,
                end_time: endTime,
                exclude_appointment_id: excludeAppointmentId
            }
        });
        return data.available;
    },

    async create(appointment: NewAppointment) {
        const { data } = await api.post<Appointment>('/appointments', appointment);
        return data;
    },

    async updateStatus(id: string, status: string) {
        const { data } = await api.put<Appointment>(`/appointments/${id}/status`, { status });
        return data;
    },

    async update(id: string, updates: Partial<{
        appointment_date: string;
        start_time: string;
        end_time: string;
        status: string;
        reason: string;
        notes: string;
    }>) {
        const { data } = await api.put<Appointment>(`/appointments/${id}`, updates);
        return data;
    },

    async delete(id: string) {
        await api.delete(`/appointments/${id}`);
    }
};
