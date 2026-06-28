/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Stubbed workflowService to remove Supabase dependencies
import api from '../lib/api';

export const workflowService = {
    async getTemplates(category?: string) {
        const queryString = category ? `?category=${category}` : '';
        const response = await api.get(`/workflows/templates${queryString}`);
        return response.data;
    },

    async getTemplateWithSteps(templateId: string) {
        const response = await api.get(`/workflows/templates/${templateId}`);
        return {
            template: response.data,
            steps: response.data.steps || []
        };
    },

    async createTemplate(template: any) {
        const response = await api.post('/workflows/templates', template);
        return response.data;
    },

    async updateTemplate(id: string, updates: any) {
        const response = await api.put(`/workflows/templates/${id}`, updates);
        return response.data;
    },

    async addStep(step: any) {
        if (!step.workflow_id) throw new Error("Workflow ID required for adding step");
        const response = await api.post(`/workflows/templates/${step.workflow_id}/steps`, step);
        return response.data;
    },

    async updateStep(id: string, updates: any) {
        // Not implemented in backend yet, stubbing for now to avoid break
        console.warn('Backend: workflowService.updateStep not fully implemented');
        return { id, ...updates };
    },

    async deleteStep(_id: string) {
        // Not implemented in backend yet, stubbing
        console.warn('Backend: workflowService.deleteStep not implemented');
    },

    async startWorkflow(workflowId: string, patientId: string, triggerEvent: string, triggerData?: any) {
        const response = await api.post('/workflows/instances', {
            workflow_id: workflowId,
            patient_id: patientId,
            trigger_event: triggerEvent,
            trigger_data: triggerData
        });
        return response.data;
    },

    // Alias for CarePlanSelector compatibility
    async createInstance(data: { workflow_id: string; patient_id: string }) {
        return this.startWorkflow(data.workflow_id, data.patient_id, 'manual_enrollment', {});
    },

    async getPatientWorkflows(patientId: string, status?: string) {
        let queryString = `?patient_id=${patientId}`;
        if (status) queryString += `&status=${status}`;
        const response = await api.get(`/workflows/instances${queryString}`);
        return response.data;
    },

    // Stubbed methods
    async getWorkflowsForExecution() { return []; },
    async updateInstanceStatus(instanceId: string, status: string) { return { id: instanceId, status }; },
    async recordStepExecution(execution: any) { return { ...execution, id: 'mock-execution-id' }; },
    async getExecutionHistory(_instanceId: string) { return []; },
    async pauseWorkflow(instanceId: string) { return { id: instanceId, status: 'paused' }; },
    async resumeWorkflow(instanceId: string) { return { id: instanceId, status: 'active' }; },
    async cancelWorkflow(instanceId: string) { return { id: instanceId, status: 'cancelled' }; },
    async completeWorkflow(instanceId: string) { return { id: instanceId, status: 'completed' }; },
    async getWorkflowStats() { return { total: 0, active: 0, completed: 0, paused: 0, cancelled: 0, failed: 0 }; },
    async runAutomationCycle() { return { processed: 0, errors: 0 }; },
    async processInstance(_instance: any) { },
    async moveToNextStep(_instance: any, _currentStep: any) { },
    async launchWorkflowForAudience(_workflowId: string, _audience: string) { return { count: 0 }; }
};
