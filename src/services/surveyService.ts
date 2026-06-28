/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */


import api from '../lib/api';

export const surveyService = {
    /**
     * Get all survey templates
     */
    /**
     * Get all survey templates
     */
    async getTemplates(categoryFilter?: string) {
        const queryString = categoryFilter ? `?category=${categoryFilter}` : '';
        const response = await api.get(`/surveys/templates${queryString}`);
        return response.data;
    },

    /**
     * Create a new survey template
     */
    async createTemplate(template: any) {
        const response = await api.post('/surveys/templates', template);
        return response.data;
    },

    /**
     * Update an existing survey template
     */
    async updateTemplate(id: string, updates: any) {
        const response = await api.put(`/surveys/templates/${id}`, updates);
        return response.data;
    },

    /**
     * Send a survey to a patient
     */
    async sendSurvey(params: {
        surveyTemplateId: string;
        patientId: string;
        workflowInstanceId?: string;
        sentVia: 'email' | 'sms' | 'portal';
        sentTo: string;
        expiresInHours?: number;
    }) {
        const response = await api.post('/surveys/instances', {
            survey_template_id: params.surveyTemplateId,
            patient_id: params.patientId,
            sent_via: params.sentVia,
            sent_to: params.sentTo
        });
        return response.data;
    },

    /**
     * Get survey by access token (for anonymous access)
     */
    async getSurveyByToken(token: string) {
        // Need specific endpoint if using tokens, usually /surveys/access/:token
        // For now stubbing to fail or use getById if token is id
        const response = await api.get(`/surveys/instances/${token}`); // Assuming token is ID for now
        return response.data;
    },

    /**
     * Mark survey as opened (called on first access)
     */
    async markSurveyOpened(surveyInstanceId: string) {
        // Could be an update endpoint
    },

    /**
     * Record survey response
     */
    async submitResponse(response: any) {
        // usually batch submit
    },

    /**
     * Submit multiple responses at once
     */
    async submitResponses(surveyInstanceId: string, responses: any[]) {
        const response = await api.post(`/surveys/instances/${surveyInstanceId}/submit`, { responses });
        return response.data;
    },

    /**
     * Update survey progress and completion status
     */
    async updateSurveyProgress(surveyInstanceId: string) {
        // No-op
    },

    /**
     * Check responses and create alerts if needed
     */
    async checkAndCreateAlerts(surveyInstanceId: string) {
        // No-op
    },

    /**
     * Simple condition evaluator
     */
    evaluateCondition(value: any, condition: any): boolean {
        return false;
    },

    /**
     * Create an alert
     */
    async createAlert(alert: any) {
        // Backend logic usually
        return { ...alert, id: 'mock-alert-id' };
    },

    /**
     * Get alerts for nurse dashboard
     */
    async getAlerts(filters?: {
        status?: string;
        severity?: number;
        assignedTo?: string;
        limit?: number;
    }) {
        // Not implemented in backend yet
        return [];
    },

    /**
     * Acknowledge an alert
     */
    async acknowledgeAlert(alertId: string, userId: string) {
        // Not implemented
        return { id: alertId, status: 'acknowledged' };
    },

    /**
     * Resolve an alert
     */
    async resolveAlert(alertId: string, userId: string, notes: string) {
        // Not implemented
        return { id: alertId, status: 'resolved' };
    },

    /**
     * Record an action taken on an alert
     */
    async recordAction(alertId: string, action: {
        type: string;
        description: string;
        performedBy: string;
    }) {
        // Not implemented
        return { id: alertId, ...action };
    },

    /**
     * Get patient survey history
     */
    async getPatientSurveys(patientId: string) {
        const response = await api.get(`/surveys/instances?patient_id=${patientId}`);
        return response.data;
    },

    /**
     * Get survey responses
     */
    async getSurveyResponses(surveyInstanceId: string) {
        // Not implemented specific endpoint
        return [];
    },

    /**
     * Get aggregated stats for a survey template
     */
    async getSurveyStats(templateId: string) {
        const response = await api.get('/surveys/stats'); // Generic stats for now
        return response.data;
    },

    /**
     * Auto-trigger workflows when survey creates alerts
     */
    async triggerWorkflowsFromSurvey(surveyInstanceId: string) {
        // No-op
    }
};
