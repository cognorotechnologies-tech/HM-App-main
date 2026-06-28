// @ts-nocheck - Bypassing TypeScript strict checks
import api from '../lib/axios';

// ==================== TYPES ====================

export interface PrescriptionTemplate {
    id: string;
    doctor_id: string;
    template_name: string;
    description?: string;
    diagnosis?: string;
    medicines: MedicineItem[];
    tests: string[];
    instructions?: string;
    follow_up_days?: number;
    is_active: boolean;
    use_count: number;
    created_at: string;
    updated_at: string;
}

export interface MedicineItem {
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    timing: string;
}

export interface NewPrescriptionTemplate {
    template_name: string;
    description?: string;
    diagnosis?: string;
    medicines: MedicineItem[];
    tests?: string[];
    instructions?: string;
    follow_up_days?: number;
}

export interface DoctorMedicineHistory {
    id: string;
    doctor_id: string;
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    timing: string;
    last_used_at: string;
    use_count: number;
}

export interface DoctorPatientNote {
    id: string;
    doctor_id: string;
    patient_id: string;
    note_text: string;
    flag_color: 'yellow' | 'red' | 'blue' | 'green';
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
}

// ==================== PRESCRIPTION TEMPLATES ====================

export const prescriptionTemplateService = {
    /**
     * Get all active templates for the current doctor
     */
    async getAll() {
        const { data } = await api.get<PrescriptionTemplate[]>('/prescription-templates');
        return data || [];
    },

    /**
     * Get a single template by ID
     */
    async getById(id: string) {
        const { data } = await api.get<PrescriptionTemplate>(`/prescription-templates/${id}`);
        return data;
    },

    /**
     * Create a new prescription template
     */
    async create(template: NewPrescriptionTemplate) {
        const { data } = await api.post<PrescriptionTemplate>('/prescription-templates', template);
        return data;
    },

    /**
     * Update an existing template
     */
    async update(id: string, template: Partial<NewPrescriptionTemplate>) {
        const { data } = await api.put<PrescriptionTemplate>(`/prescription-templates/${id}`, template);
        return data;
    },

    /**
     * Soft delete (deactivate) a template
     */
    async deactivate(id: string) {
        const { data } = await api.patch<PrescriptionTemplate>(`/prescription-templates/${id}/deactivate`);
        return data;
    },

    /**
     * Hard delete a template
     */
    async delete(id: string) {
        await api.delete(`/prescription-templates/${id}`);
    },

    /**
     * Increment template use count (called when applied)
     */
    async incrementUseCount(id: string) {
        await api.post(`/prescription-templates/${id}/increment-use`);
    },

    /**
     * Get most used templates (sorted by use_count)
     */
    async getMostUsed(limit: number = 5) {
        const { data } = await api.get<PrescriptionTemplate[]>('/prescription-templates/most-used', {
            params: { limit }
        });
        return data || [];
    }
};

// ==================== MEDICINE HISTORY ====================

export const medicineHistoryService = {
    /**
     * Get recently used medicines for the current doctor
     */
    async getRecentlyUsed(limit: number = 20) {
        const { data } = await api.get<DoctorMedicineHistory[]>('/medicine-history/recent', {
            params: { limit }
        });
        return data || [];
    },

    /**
     * Get most frequently used medicines
     */
    async getMostUsed(limit: number = 10) {
        const { data } = await api.get<DoctorMedicineHistory[]>('/medicine-history/most-used', {
            params: { limit }
        });
        return data || [];
    },

    /**
     * Track medicine usage (called when prescription created)
     */
    async trackUsage(medicine: MedicineItem) {
        await api.post('/medicine-history/track', medicine);
    },

    /**
     * Track multiple medicines at once
     */
    async trackMultiple(medicines: MedicineItem[]) {
        await api.post('/medicine-history/track-batch', { medicines });
    },

    /**
     * Search medicine history
     */
    async search(query: string) {
        const { data } = await api.get<DoctorMedicineHistory[]>('/medicine-history/search', {
            params: { q: query }
        });
        return data || [];
    }
};

// ==================== DOCTOR PATIENT NOTES ====================

export const doctorPatientNoteService = {
    /**
     * Get note for a specific patient
     */
    async getByPatient(patientId: string) {
        const { data } = await api.get<DoctorPatientNote>(`/doctor-notes/patient/${patientId}`);
        return data;
    },

    /**
     * Get all notes for current doctor
     */
    async getAll() {
        const { data } = await api.get<DoctorPatientNote[]>('/doctor-notes');
        return data || [];
    },

    /**
     * Get pinned notes
     */
    async getPinned() {
        const { data } = await api.get<DoctorPatientNote[]>('/doctor-notes/pinned');
        return data || [];
    },

    /**
     * Create or update note for a patient
     */
    async upsert(patientId: string, noteText: string, flagColor: DoctorPatientNote['flag_color'] = 'yellow') {
        const { data } = await api.post<DoctorPatientNote>('/doctor-notes', {
            patient_id: patientId,
            note_text: noteText,
            flag_color: flagColor
        });
        return data;
    },

    /**
     * Toggle pin status
     */
    async togglePin(noteId: string) {
        const { data } = await api.patch<DoctorPatientNote>(`/doctor-notes/${noteId}/toggle-pin`);
        return data;
    },

    /**
     * Delete a note
     */
    async delete(noteId: string) {
        await api.delete(`/doctor-notes/${noteId}`);
    }
};

// ==================== CONSULTATION TRACKING ====================

export const consultationTimerService = {
    /**
     * Start consultation timer
     */
    async startConsultation(appointmentId: string) {
        const { data } = await api.post(`/appointments/${appointmentId}/start-consultation`);
        return data;
    },

    /**
     * End consultation timer
     */
    async endConsultation(appointmentId: string) {
        const { data } = await api.post(`/appointments/${appointmentId}/end-consultation`);
        return data;
    },

    /**
     * Get doctor consultation stats
     */
    async getStats(doctorId: string, startDate?: string, endDate?: string) {
        const { data } = await api.get('/consultation-stats', {
            params: {
                doctor_id: doctorId,
                start_date: startDate,
                end_date: endDate
            }
        });
        return data;
    },

    /**
     * Get today's stats for current doctor
     */
    async getTodayStats() {
        const { data } = await api.get('/consultation-stats/today');
        return data;
    }
};
