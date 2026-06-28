-- Phase 1 Feature 2: Prescription Customization
-- Enable doctors to customize prescription layouts with letterheads, signatures, and QR codes

-- 1. Prescription Layout Templates Table
CREATE TABLE IF NOT EXISTS prescription_layout_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "Classic", "Modern", "Minimal", "Custom"
    description TEXT,
    template_type VARCHAR(50) DEFAULT 'system', -- 'system' or 'custom'
    
    -- Layout configuration (JSON)
    layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Example structure:
    -- {
    --   "header": { "show_logo": true, "show_hospital_name": true, "alignment": "center" },
    --   "body": { "font_size": 12, "line_spacing": 1.5, "show_borders": false },
    --   "footer": { "show_signature": true, "show_qr": true, "disclaimer_text": "" }
    -- }
    
    -- Styling
    primary_color VARCHAR(7) DEFAULT '#4F46E5', -- Hex color
    secondary_color VARCHAR(7) DEFAULT '#818CF8',
    font_family VARCHAR(50) DEFAULT 'Arial',
    
    -- Branding
    logo_url TEXT, -- URL or path to logo
    header_image_url TEXT, -- Custom header image
    footer_image_url TEXT, -- Custom footer image
    
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctor Prescription Preferences
CREATE TABLE IF NOT EXISTS doctor_prescription_preferences (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    
    -- Selected template
    layout_template_id INTEGER REFERENCES prescription_layout_templates(id),
    
    -- Custom letterhead
    letterhead_enabled BOOLEAN DEFAULT false,
    letterhead_html TEXT, -- Custom HTML for letterhead
    
    -- Signature
    signature_image_url TEXT, -- Uploaded signature image
    signature_text VARCHAR(200), -- e.g., "Dr. John Doe, MBBS, MD"
    show_signature BOOLEAN DEFAULT true,
    
    -- QR Code configuration
    qr_code_enabled BOOLEAN DEFAULT true,
    qr_code_data VARCHAR(50) DEFAULT 'prescription_id', -- 'prescription_id', 'doctor_id', 'custom_url'
    qr_code_custom_url TEXT,
    
    -- Hospital/Clinic Info (overrides)
    clinic_name VARCHAR(200),
    clinic_address TEXT,
    clinic_phone VARCHAR(20),
    clinic_email VARCHAR(100),
    clinic_website VARCHAR(200),
    registration_number VARCHAR(100), -- Medical registration number
    
    -- Additional customizations
    custom_footer_text TEXT,
    watermark_text VARCHAR(100),
    show_watermark BOOLEAN DEFAULT false,
    
    -- Paper size
    paper_size VARCHAR(20) DEFAULT 'A4', -- 'A4', 'Letter', 'A5'
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(doctor_id) -- One preference per doctor
);

-- 3. System Default Templates
INSERT INTO prescription_layout_templates (name, description, template_type, layout_config) VALUES
(
    'Classic',
    'Traditional prescription layout with clean formatting',
    'system',
    '{
        "header": {"show_logo": true, "show_hospital_name": true, "alignment": "center"},
        "body": {"font_size": 12, "line_spacing": 1.5, "show_borders": true},
        "footer": {"show_signature": true, "show_qr": true}
    }'::jsonb
),
(
    'Modern',
    'Contemporary design with color accents',
    'system',
    '{
        "header": {"show_logo": true, "show_hospital_name": true, "alignment": "left", "gradient_bg": true},
        "body": {"font_size": 11, "line_spacing": 1.4, "show_borders": false, "card_style": true},
        "footer": {"show_signature": true, "show_qr": true, "split_layout": true}
    }'::jsonb
),
(
    'Minimal',
    'Simple and clean prescription format',
    'system',
    '{
        "header": {"show_logo": false, "show_hospital_name": true, "alignment": "left"},
        "body": {"font_size": 11, "line_spacing": 1.3, "show_borders": false},
        "footer": {"show_signature": true, "show_qr": false}
    }'::jsonb
);

-- Set Classic as default
UPDATE prescription_layout_templates SET is_default = true WHERE name = 'Classic';

-- 4. Indexes
CREATE INDEX idx_doctor_prefs_doctor ON doctor_prescription_preferences(doctor_id);
CREATE INDEX idx_layout_templates_active ON prescription_layout_templates(is_active);
CREATE INDEX idx_layout_templates_type ON prescription_layout_templates(template_type);

-- 5. Function to get doctor's prescription preferences (with defaults)
CREATE OR REPLACE FUNCTION get_doctor_prescription_preferences(p_doctor_id INTEGER)
RETURNS TABLE (
    template_name VARCHAR,
    layout_config JSONB,
    primary_color VARCHAR,
    signature_image_url TEXT,
    signature_text VARCHAR,
    qr_code_enabled BOOLEAN,
    clinic_name VARCHAR,
    clinic_address TEXT,
    clinic_phone VARCHAR,
    paper_size VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(plt.name, 'Classic') as template_name,
        COALESCE(plt.layout_config, '{}'::jsonb) as layout_config,
        COALESCE(plt.primary_color, '#4F46E5') as primary_color,
        dpp.signature_image_url,
        dpp.signature_text,
        COALESCE(dpp.qr_code_enabled, true) as qr_code_enabled,
        dpp.clinic_name,
        dpp.clinic_address,
        dpp.clinic_phone,
        COALESCE(dpp.paper_size, 'A4') as paper_size
    FROM doctor_prescription_preferences dpp
    LEFT JOIN prescription_layout_templates plt ON dpp.layout_template_id = plt.id
    WHERE dpp.doctor_id = p_doctor_id
    
    UNION ALL
    
    -- If no preferences exist, return system defaults
    SELECT 
        plt.name,
        plt.layout_config,
        plt.primary_color,
        NULL::TEXT as signature_image_url,
        NULL::VARCHAR as signature_text,
        true as qr_code_enabled,
        NULL::VARCHAR as clinic_name,
        NULL::TEXT as clinic_address,
        NULL::VARCHAR as clinic_phone,
        'A4'::VARCHAR as paper_size
    FROM prescription_layout_templates plt
    WHERE plt.is_default = true
    AND NOT EXISTS (
        SELECT 1 FROM doctor_prescription_preferences WHERE doctor_id = p_doctor_id
    )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to update doctor preferences (upsert)
CREATE OR REPLACE FUNCTION upsert_doctor_prescription_preferences(
    p_doctor_id INTEGER,
    p_layout_template_id INTEGER DEFAULT NULL,
    p_signature_image_url TEXT DEFAULT NULL,
    p_signature_text VARCHAR DEFAULT NULL,
    p_qr_code_enabled BOOLEAN DEFAULT true,
    p_clinic_name VARCHAR DEFAULT NULL,
    p_clinic_address TEXT DEFAULT NULL,
    p_paper_size VARCHAR DEFAULT 'A4'
)
RETURNS INTEGER AS $$
DECLARE
    pref_id INTEGER;
BEGIN
    INSERT INTO doctor_prescription_preferences (
        doctor_id,
        layout_template_id,
        signature_image_url,
        signature_text,
        qr_code_enabled,
        clinic_name,
        clinic_address,
        paper_size,
        updated_at
    ) VALUES (
        p_doctor_id,
        p_layout_template_id,
        p_signature_image_url,
        p_signature_text,
        p_qr_code_enabled,
        p_clinic_name,
        p_clinic_address,
        p_paper_size,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (doctor_id) DO UPDATE SET
        layout_template_id = COALESCE(EXCLUDED.layout_template_id, doctor_prescription_preferences.layout_template_id),
        signature_image_url = COALESCE(EXCLUDED.signature_image_url, doctor_prescription_preferences.signature_image_url),
        signature_text = COALESCE(EXCLUDED.signature_text, doctor_prescription_preferences.signature_text),
        qr_code_enabled = EXCLUDED.qr_code_enabled,
        clinic_name = COALESCE(EXCLUDED.clinic_name, doctor_prescription_preferences.clinic_name),
        clinic_address = COALESCE(EXCLUDED.clinic_address, doctor_prescription_preferences.clinic_address),
        paper_size = EXCLUDED.paper_size,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO pref_id;
    
    RETURN pref_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Add prescription_layout_id column to prescriptions table (optional - for tracking which layout was used)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'layout_used') THEN
        ALTER TABLE prescriptions ADD COLUMN layout_used VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'qr_code_data') THEN
        ALTER TABLE prescriptions ADD COLUMN qr_code_data TEXT; -- Store QR code content
    END IF;
END $$;

COMMENT ON TABLE prescription_layout_templates IS 'Prescription layout templates (system and custom)';
COMMENT ON TABLE doctor_prescription_preferences IS 'Doctor-specific prescription customization preferences';
COMMENT ON COLUMN doctor_prescription_preferences.qr_code_data IS 'What to encode in QR: prescription_id, doctor_id, or custom_url';
