// Prescription Customization Service
import pool from '../db';

class PrescriptionCustomizationService {
    /**
     * Get all available layout templates
     */
    async getAllTemplates() {
        const query = `
            SELECT * FROM prescription_layout_templates
            WHERE is_active = true
            ORDER BY template_type, name
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    /**
     * Get doctor's prescription preferences
     */
    async getDoctorPreferences(doctorId: number) {
        const query = `SELECT * FROM get_doctor_prescription_preferences($1)`;
        const result = await pool.query(query, [doctorId]);
        return result.rows[0] || null;
    }

    /**
     * Get full doctor preferences (detailed)
     */
    async getDoctorPreferencesDetailed(doctorId: number) {
        const query = `
            SELECT 
                dpp.*,
                plt.name as template_name,
                plt.layout_config,
                plt.primary_color,
                plt.secondary_color,
                plt.font_family
            FROM doctor_prescription_preferences dpp
            LEFT JOIN prescription_layout_templates plt ON dpp.layout_template_id = plt.id
            WHERE dpp.doctor_id = $1::uuid
        `;
        const result = await pool.query(query, [doctorId]);
        return result.rows[0] || null;
    }

    /**
     * Update doctor's prescription preferences
     */
    async updateDoctorPreferences(doctorId: number, preferences: any) {
        const {
            layout_template_id,
            signature_image_url,
            signature_text,
            qr_code_enabled = true,
            clinic_name,
            clinic_address,
            clinic_phone,
            clinic_email,
            clinic_website,
            registration_number,
            custom_footer_text,
            paper_size = 'A4',
            watermark_text,
            show_watermark = false
        } = preferences;

        const query = `
            INSERT INTO doctor_prescription_preferences (
                doctor_id,
                layout_template_id,
                signature_image_url,
                signature_text,
                qr_code_enabled,
                clinic_name,
                clinic_address,
                clinic_phone,
                clinic_email,
                clinic_website,
                registration_number,
                custom_footer_text,
                paper_size,
                watermark_text,
                show_watermark,
                updated_at
            ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
            ON CONFLICT (doctor_id) DO UPDATE SET
                layout_template_id = COALESCE($2, doctor_prescription_preferences.layout_template_id),
                signature_image_url = COALESCE($3, doctor_prescription_preferences.signature_image_url),
                signature_text = COALESCE($4, doctor_prescription_preferences.signature_text),
                qr_code_enabled = $5,
                clinic_name = COALESCE($6, doctor_prescription_preferences.clinic_name),
                clinic_address = COALESCE($7, doctor_prescription_preferences.clinic_address),
                clinic_phone = COALESCE($8, doctor_prescription_preferences.clinic_phone),
                clinic_email = COALESCE($9, doctor_prescription_preferences.clinic_email),
                clinic_website = COALESCE($10, doctor_prescription_preferences.clinic_website),
                registration_number = COALESCE($11, doctor_prescription_preferences.registration_number),
                custom_footer_text = COALESCE($12, doctor_prescription_preferences.custom_footer_text),
                paper_size = $13,
                watermark_text = COALESCE($14, doctor_prescription_preferences.watermark_text),
                show_watermark = $15,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;

        const result = await pool.query(query, [
            doctorId,
            layout_template_id,
            signature_image_url,
            signature_text,
            qr_code_enabled,
            clinic_name,
            clinic_address,
            clinic_phone,
            clinic_email,
            clinic_website,
            registration_number,
            custom_footer_text,
            paper_size,
            watermark_text,
            show_watermark
        ]);

        return result.rows[0];
    }

    /**
     * Upload signature image (placeholder - actual upload handled by multer)
     */
    async updateSignature(doctorId: number, signatureUrl: string, signatureText?: string) {
        const query = `
            INSERT INTO doctor_prescription_preferences (doctor_id, signature_image_url, signature_text, updated_at)
            VALUES ($1::uuid, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (doctor_id) DO UPDATE SET
                signature_image_url = $2,
                signature_text = COALESCE($3, doctor_prescription_preferences.signature_text),
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;

        const result = await pool.query(query, [doctorId, signatureUrl, signatureText]);
        return result.rows[0];
    }

    /**
     * Generate QR code data for prescription
     */
    generateQRData(prescriptionId: number, doctorId: number, qrType: string = 'prescription_id', customUrl?: string) {
        switch (qrType) {
            case 'prescription_id':
                return `RX-${prescriptionId}`;
            case 'doctor_id':
                return `Dr-${doctorId}`;
            case 'custom_url':
                return customUrl || '';
            case 'verification_url':
                return `${process.env.APP_URL || 'https://hospital.com'}/verify-prescription/${prescriptionId}`;
            default:
                return `RX-${prescriptionId}`;
        }
    }

    /**
     * Create custom template (for doctors to save their own)
     */
    async createCustomTemplate(doctorId: number, templateData: any) {
        const { name, description, layout_config, primary_color, secondary_color, font_family } = templateData;

        const query = `
            INSERT INTO prescription_layout_templates (
                name,
                description,
                template_type,
                layout_config,
                primary_color,
                secondary_color,
                font_family
            ) VALUES ($1, $2, 'custom', $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [
            name,
            description,
            layout_config,
            primary_color,
            secondary_color,
            font_family
        ]);

        return result.rows[0];
    }
}

export default new PrescriptionCustomizationService();
