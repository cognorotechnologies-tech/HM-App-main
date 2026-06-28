import api from '../lib/api';

export interface PrescriptionPreferences {
    id: string;
    doctor_id: string;
    template_id?: string;
    show_header: boolean;
    header_text?: string;
    show_logo: boolean;
    logo_url?: string;
    show_signature: boolean;
    signature_url?: string;
    signature_text?: string;
    show_watermark: boolean;
    watermark_text?: string;
    primary_color: string;
    layout_mode: 'modern' | 'classic' | 'minimal';
    font_family: string;
    margin_top: number;
    margin_bottom: number;
    margin_left: number;
    margin_right: number;
    show_qr_code: boolean;
    qr_code_type: 'verification' | 'info' | 'url';
    custom_url?: string;
    footer_text?: string;
}

export const prescriptionCustomizationService = {
    /**
     * Get prescription customization preferences for the current doctor
     */
    async getPreferences() {
        const response = await api.get<PrescriptionPreferences>('/prescription-customization/preferences');
        return response.data;
    },

    /**
     * Update prescription preferences
     */
    async updatePreferences(preferences: Partial<PrescriptionPreferences>) {
        const response = await api.put<PrescriptionPreferences>('/prescription-customization/preferences', preferences);
        return response.data;
    },

    /**
     * Upload doctor signature
     */
    async uploadSignature(file: File, signatureText?: string) {
        const formData = new FormData();
        formData.append('signature', file);
        if (signatureText) {
            formData.append('signature_text', signatureText);
        }

        const response = await api.post('/prescription-customization/signature', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Generate QR code for a prescription
     */
    async generateQRCode(prescriptionId: string, type: 'verification' | 'info' | 'url', customUrl?: string) {
        const response = await api.post('/prescription-customization/qr-code', {
            prescription_id: prescriptionId,
            qr_type: type,
            custom_url: customUrl
        });
        return response.data; // Returns { qr_data: string (base64) }
    }
};
