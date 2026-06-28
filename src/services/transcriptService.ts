import axios from 'axios';

const API_URL = 'http://localhost:3001';

export interface TranscriptData {
    appointment_id: string;
    doctor_id: string;
    patient_id: string;
    transcript_text: string;
    metadata?: any;
}

class TranscriptService {
    async save(data: TranscriptData) {
        const response = await axios.post(`${API_URL}/transcripts`, data);
        return response.data;
    }

    async getByAppointment(appointmentId: string) {
        try {
            const response = await axios.get(`${API_URL}/transcripts/appointment/${appointmentId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
}

export const transcriptService = new TranscriptService();
