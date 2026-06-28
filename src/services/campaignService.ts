/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../lib/api';
// Stubbed campaignService to remove Supabase dependencies

export interface CampaignStats {
    total: number;
    draft: number;
    scheduled: number;
    sending: number;
    completed: number;
    cancelled: number;
}

export interface CampaignFilters {
    status?: string;
    channel?: string;
    campaign_type?: string;
    created_by?: string;
    start_date?: string;
    end_date?: string;
}

export interface RecipientFilters {
    status?: string;
    channel?: string;
}

export interface CampaignTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    type: string;
    category: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    subject?: string;
    variables?: any;
    // Added for compatibility
    body?: string;
    is_system?: boolean;
    channel?: string;
    template_type?: string;
}

export interface CampaignRecipient {
    id: string;
    campaign_id: string;
    patient_id: string;
    status: string;
    channel: string;
    sent_at: string | null;
    delivered_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
    // Joined
    patient?: {
        first_name: string;
        last_name: string;
        contact_number?: string;
        email?: string;
    };
}

export interface Campaign {
    id: string;
    name: string;
    description: string;
    status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled' | 'failed';
    campaign_type: string;
    type: string;
    channel: 'email' | 'sms' | 'both';
    subject: string;
    content: string;
    message: string;
    target_type: 'manual' | 'all' | 'filtered';
    scheduled_at: string | null;
    sent_at: string | null;
    completed_at: string | null;
    total_recipients: number;
    success_count: number;
    failure_count: number;
    failed_count: number;
    created_by: string;
    created_at: string;
    updated_at: string;
    metadata: Record<string, any>;
    filters: Record<string, any>;
    send_type: 'scheduled' | 'immediate';
    started_at: string | null;
    sent_count: number;
    delivered_count: number;
    opened_count: number;
    clicked_count: number;
    paused_at: string | null;
    cancelled_at: string | null;
    failed_at: string | null;
}

export const campaignService = {
    async create(campaign: any): Promise<Campaign> {
        const response = await api.post('/campaigns', campaign);
        return response.data;
    },

    async update(id: string, updates: any) {
        const response = await api.put(`/campaigns/${id}`, updates);
        return response.data;
    },

    async delete(id: string) {
        await api.delete(`/campaigns/${id}`);
    },

    async getById(id: string): Promise<Campaign> {
        const response = await api.get(`/campaigns/${id}`);
        return response.data;
    },

    async list(filters?: any) {
        let queryString = '';
        if (filters) {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key]);
            });
            queryString = `?${params.toString()}`;
        }
        const response = await api.get(`/campaigns${queryString}`);
        return response.data;
    },

    async getStats(): Promise<CampaignStats> {
        const response = await api.get('/campaigns/stats');
        return response.data;
    },

    async getRecipients(campaignId: string, filters?: any) {
        const response = await api.get(`/campaigns/${campaignId}/recipients`);
        return response.data;
    },

    async calculateRecipientCount(_targetType: string, _filters: any) {
        // This might need a specific endpoint if calculation logic is complex on backend
        // For now, let's mock 0 or add an endpoint if needed.
        return 0;
    },

    async addRecipients(_campaignId: string, _recipients: any[]) {
        // Need to implement backend endpoint for this if used
    },

    async getTemplates(channel?: string) {
        const response = await api.get(`/campaigns/templates${channel ? `?channel=${channel}` : ''}`);
        return response.data;
    },

    async getTemplateById(id: string) {
        const response = await api.get(`/campaigns/templates/${id}`);
        return response.data;
    },

    async scheduleCampaign(campaignId: string, scheduledAt: Date) {
        await this.update(campaignId, { scheduled_at: scheduledAt, status: 'scheduled' });
    },

    async updateRecipientStatus(_recipientId: string, _status: string, _errorMessage?: string) {
        // Implement if needed
    },

    async getAnalytics(_campaignId: string) {
        // Implement if needed, for now empty
        return [];
    },

    replaceVariables(template: string, variables: Record<string, string>): string {
        let result = template;
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, variables[key]);
        });
        return result;
    }
};
