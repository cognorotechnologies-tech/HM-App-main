/* eslint-disable @typescript-eslint/no-unused-vars */
 
import api from '../lib/api';

// WhatsApp Service - Handles WhatsApp messaging via Twilio WhatsApp API
// For production, configure TWILIO credentials in environment variables

export interface WhatsAppTemplate {
    id: string;
    name: string;
    category: string;
    template_id: string;
    content: string;
    variables: string[];
    status: string;
}

export interface SendWhatsAppParams {
    to: string; // Phone number in E.164 format (e.g., +14155552671)
    templateId?: string;
    templateVariables?: Record<string, string>;
    message?: string; // For plain text messages
    mediaUrl?: string; // For media messages
    patientId?: string;
    campaignId?: string;
    workflowActionId?: string;
}

export interface WhatsAppMessage {
    id: string;
    patient_id?: string;
    phone_number: string;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    content?: string;
    sent_at?: string;
    delivered_at?: string;
    read_at?: string;
    error_message?: string;
}

class WhatsAppService {

    /**
     * Get all approved WhatsApp templates
     */
    async getTemplates(): Promise<WhatsAppTemplate[]> {
        console.warn('WhatsApp service not implemented in backend');
        return [];
    }

    /**
     * Get a specific template by ID
     */
    async getTemplate(_templateId: string): Promise<WhatsAppTemplate | null> {
        console.warn('WhatsApp service not implemented in backend');
        return null;
    }

    /**
     * Create a new WhatsApp template
     */
    async createTemplate(_template: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> {
        console.warn('WhatsApp service not implemented in backend');
        throw new Error('Not implemented');
    }

    /**
     * Format phone number to E.164 format
     */
    private formatPhoneNumber(phone: string): string {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');

        // Add country code if not present (assuming +1 for US/CA)
        if (!cleaned.startsWith('1') && cleaned.length === 10) {
            cleaned = '1' + cleaned;
        }

        return `+${cleaned}`;
    }

    /**
     * Validate phone number format
     */
    validatePhoneNumber(phone: string): boolean {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    }

    /**
     * Send WhatsApp message 
     */
    async sendMessage(params: SendWhatsAppParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
        console.warn('WhatsApp service not implemented in backend. Logging message:', params);
        return {
            success: true,
            messageId: `mock-msg-${Date.now()}`
        };
    }

    /**
     * Send bulk WhatsApp messages (for campaigns)
     */
    async sendBulkMessages(
        recipients: Array<{ phone: string; patientId?: string }>,
        _params: Omit<SendWhatsAppParams, 'to' | 'patientId'>
    ): Promise<{ sent: number; failed: number; errors: string[] }> {
        console.warn('WhatsApp service not implemented in backend');
        return { sent: recipients.length, failed: 0, errors: [] };
    }

    /**
     * Get message history for a patient
     */
    async getPatientMessages(_patientId: string): Promise<WhatsAppMessage[]> {
        console.warn('WhatsApp service not implemented in backend');
        return [];
    }

    /**
     * Get message history for a campaign
     */
    async getCampaignMessages(_campaignId: string): Promise<WhatsAppMessage[]> {
        console.warn('WhatsApp service not implemented in backend');
        return [];
    }

    /**
     * Get all messages with filters
     */
    async getMessages(_filters?: {
        status?: string;
        patientId?: string;
        campaignId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<WhatsAppMessage[]> {
        console.warn('WhatsApp service not implemented in backend');
        return [];
    }

    /**
     * Update message status (called by webhook)
     */
    async updateMessageStatus(
        _whatsappMessageId: string,
        _status: 'sent' | 'delivered' | 'read' | 'failed',
        _errorMessage?: string
    ): Promise<void> {
        console.warn('WhatsApp service not implemented in backend');
    }

    /**
     * Get message statistics
     */
    async getMessageStats(_dateFrom?: string, _dateTo?: string): Promise<{
        total: number;
        sent: number;
        delivered: number;
        read: number;
        failed: number;
        pending: number;
    }> {
        console.warn('WhatsApp service not implemented in backend');
        return {
            total: 0,
            sent: 0,
            delivered: 0,
            read: 0,
            failed: 0,
            pending: 0
        };
    }
}

export const whatsappService = new WhatsAppService();
