-- Create prescription_layout_templates table
CREATE TABLE IF NOT EXISTS prescription_layout_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL, -- 'system' or 'custom'
    layout_config JSONB DEFAULT '{}',
    primary_color TEXT,
    secondary_color TEXT,
    font_family TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create doctor_prescription_preferences table
CREATE TABLE IF NOT EXISTS doctor_prescription_preferences (
    doctor_id UUID PRIMARY KEY REFERENCES doctors(id) ON DELETE CASCADE,
    layout_template_id INTEGER REFERENCES prescription_layout_templates(id),
    signature_image_url TEXT,
    signature_text TEXT,
    qr_code_enabled BOOLEAN DEFAULT true,
    clinic_name TEXT,
    clinic_address TEXT,
    clinic_phone TEXT,
    clinic_email TEXT,
    clinic_website TEXT,
    registration_number TEXT,
    custom_footer_text TEXT,
    paper_size TEXT DEFAULT 'A4',
    watermark_text TEXT,
    show_watermark BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to get doctor preferences
CREATE OR REPLACE FUNCTION get_doctor_prescription_preferences(p_doctor_id UUID)
RETURNS TABLE (
    doctor_id UUID,
    layout_template_id INTEGER,
    signature_image_url TEXT,
    signature_text TEXT,
    qr_code_enabled BOOLEAN,
    clinic_name TEXT,
    clinic_address TEXT,
    clinic_phone TEXT,
    clinic_email TEXT,
    clinic_website TEXT,
    registration_number TEXT,
    custom_footer_text TEXT,
    paper_size TEXT,
    watermark_text TEXT,
    show_watermark BOOLEAN,
    updated_at TIMESTAMP WITH TIME ZONE,
    template_name TEXT,
    layout_config JSONB,
    primary_color TEXT,
    secondary_color TEXT,
    font_family TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dpp.doctor_id,
        dpp.layout_template_id,
        dpp.signature_image_url,
        dpp.signature_text,
        dpp.qr_code_enabled,
        dpp.clinic_name,
        dpp.clinic_address,
        dpp.clinic_phone,
        dpp.clinic_email,
        dpp.clinic_website,
        dpp.registration_number,
        dpp.custom_footer_text,
        dpp.paper_size,
        dpp.watermark_text,
        dpp.show_watermark,
        dpp.updated_at,
        plt.name as template_name,
        plt.layout_config,
        plt.primary_color,
        plt.secondary_color,
        plt.font_family
    FROM doctor_prescription_preferences dpp
    LEFT JOIN prescription_layout_templates plt ON dpp.layout_template_id = plt.id
    WHERE dpp.doctor_id = p_doctor_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default templates
INSERT INTO prescription_layout_templates (name, description, template_type, layout_config, primary_color, secondary_color, font_family)
VALUES 
('Classic Minimal', 'Clean and professional design with minimal distractions.', 'system', '{"headerStyle": "simple", "showLogo": true}', '#000000', '#666666', 'Inter'),
('Modern Blue', 'Trust-inspiring blue color scheme with modern typography.', 'system', '{"headerStyle": "modern", "showLogo": true}', '#2563EB', '#1E40AF', 'Roboto'),
('Elegant Serif', 'Sophisticated look using serif fonts, suitable for specialists.', 'system', '{"headerStyle": "centered", "showLogo": true}', '#333333', '#555555', 'Merriweather')
ON CONFLICT DO NOTHING;
