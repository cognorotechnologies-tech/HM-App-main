/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Stubbed trackingService to remove Supabase dependencies
import api from '../lib/api';

export type UserActionType = 'email_open' | 'link_click' | 'survey_submit' | 'survey_question_answer' | 'page_view';

export const trackingService = {
    async trackEvent(params: any) {
        // params typically: { patient_id, action_type, action_data, workflow_instance_id }
        const response = await api.post('/tracking', params);
        return response.data;
    },

    async getPatientJourney(patientId: string) {
        const response = await api.get(`/tracking?patient_id=${patientId}`);
        return response.data;
    },

    async getWorkflowStats(workflowInstanceId: string) {
        // tracking endpoints currently general.
        return null;
    }
};
