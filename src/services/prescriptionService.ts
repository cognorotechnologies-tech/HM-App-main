 
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../lib/axios';

export interface Prescription {
    id: string;
    patient_id: string;
    doctor_id: string;
    consultation_id: string | null;
    prescription_number: string;
    diagnosis: string | null;
    medicines: any;
    instructions: string | null;
    investigations: any;
    follow_up_date: string | null;
    created_at: string;
}

export interface NewPrescription {
    patient_id: string;
    doctor_id: string;
    consultation_id?: string;
    prescription_number: string;
    diagnosis?: string;
    medicines?: any;
    instructions?: string;
    investigations?: any;
    follow_up_date?: string;
}

export const prescriptionService = {
    async getAll() {
        const { data } = await api.get<Prescription[]>('/prescriptions');
        return data;
    },

    async getById(id: string) {
        const { data } = await api.get<Prescription>(`/prescriptions/${id}`);
        return data;
    },

    async getByPatient(patientId: string) {
        const { data } = await api.get<Prescription[]>('/prescriptions/by-patient', {
            params: { patient_id: patientId }
        });
        return data;
    },

    async getByAppointment(appointmentId: string) {
        const { data } = await api.get<Prescription[]>('/prescriptions/by-appointment', {
            params: { appointment_id: appointmentId }
        });
        return data;
    },

    async create(prescription: NewPrescription) {
        const { data } = await api.post<Prescription>('/prescriptions', prescription);
        return data;
    },

    async update(id: string, prescription: Partial<NewPrescription>) {
        const { data } = await api.put<Prescription>(`/prescriptions/${id}`, prescription);
        return data;
    },

    async delete(id: string) {
        await api.delete(`/prescriptions/${id}`);
    }
};
