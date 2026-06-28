import api from '../lib/axios';

export interface LabResult {
    id: string;
    patient_id: string;
    doctor_id: string;
    test_date: string;
    test_type: string;
    summary: string;
    file_url: string;
    raw_data: any;
    status: 'pending' | 'available' | 'reviewed';
    created_at: string;
}

export const labResultService = {
    async create(data: Partial<LabResult>) {
        const response = await api.post<LabResult>('/lab-results', data);
        return response.data;
    },

    async getByPatient(patientId: string) {
        const response = await api.get<LabResult[]>(`/lab-results/patient/${patientId}`);
        return response.data;
    },

    async uploadAndAnalyze(file: File, patientId: string) {
        // This endpoint should be handled by a specific upload route if using multer
        // For now, we reuse the pattern from aiService but pointing to lab-results integration
        // Actually, let's keep using the aiService for upload/analysis, 
        // then save the RESULT to labResultService.create
        return null;
    }
};
