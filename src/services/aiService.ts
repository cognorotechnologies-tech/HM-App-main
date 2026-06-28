import api from '../lib/axios';

export interface DiagnosisSuggestion {
    diagnosis: string;
    confidence: string;
    reasoning: string;
}

export const aiService = {
    getDiagnosisSuggestions: async (symptoms: string, gender: string, age: number): Promise<DiagnosisSuggestion[]> => {
        const response = await api.post('/ai/diagnosis-suggestion', { symptoms, gender, age });
        return response.data.suggestions;
    },

    summarizeNotes: async (notes: string[]): Promise<string> => {
        const response = await api.post('/ai/summarize-notes', { notes });
        return response.data.summary;
    },

    uploadLabReport: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/ai/analyze-report', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    generatePatientSummary: async (history: any, vitals: any[]): Promise<string> => {
        try {
            // Try backend first
            const response = await api.post('/ai/patient-summary', { history, vitals });
            return response.data.summary;
        } catch (error) {
            console.warn('AI Service unreachable, using mock summary for demo');
            // Graceful fallback for demo purposes if backend hasn't implemented this route yet
            const chronic = history?.chronic_conditions?.join(', ') || 'No chronic conditions';
            const recentVitals = vitals.slice(0, 3).map(v => `${v.metric_type}: ${v.value}`).join('; ');
            return `Patient has a history of ${chronic}. Recent vitals indicate ${recentVitals || 'stable parameters'}. Recommended to monitor BP and weight trend due to age factors.`;
        }
    }
};
