// Standalone Migration Runner - No FK Dependencies
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'hm_app_db',
    user: 'postgres',
    password: '$Predators@7837$'
});

// Simplified migrations without FK constraints
const createStandaloneMigrations = () => {
    const migrations = {
        '01_activity_log.sql': `
-- Appointment Activity Log (Standalone)
CREATE TABLE IF NOT EXISTS appointment_activity_log (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL,
    user_id INTEGER,
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_log_appointment ON appointment_activity_log(appointment_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON appointment_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action_type ON appointment_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON appointment_activity_log(created_at DESC);

COMMENT ON TABLE appointment_activity_log IS 'Audit trail for all appointment-related activities';
        `,

        '02_prescription_customization.sql': `
-- Prescription Customization (Standalone)
CREATE TABLE IF NOT EXISTS prescription_layout_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) DEFAULT 'system',
    layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    primary_color VARCHAR(7) DEFAULT '#4F46E5',
    secondary_color VARCHAR(7) DEFAULT '#818CF8',
    font_family VARCHAR(50) DEFAULT 'Arial',
    logo_url TEXT,
    header_image_url TEXT,
    footer_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctor_prescription_preferences (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL,
    layout_template_id INTEGER,
    letterhead_enabled BOOLEAN DEFAULT false,
    letterhead_html TEXT,
    signature_image_url TEXT,
    signature_text VARCHAR(200),
    show_signature BOOLEAN DEFAULT true,
    qr_code_enabled BOOLEAN DEFAULT true,
    qr_code_data VARCHAR(50) DEFAULT 'prescription_id',
    qr_code_custom_url TEXT,
    clinic_name VARCHAR(200),
    clinic_address TEXT,
    clinic_phone VARCHAR(20),
    clinic_email VARCHAR(100),
    clinic_website VARCHAR(200),
    registration_number VARCHAR(100),
    custom_footer_text TEXT,
    watermark_text VARCHAR(100),
    show_watermark BOOLEAN DEFAULT false,
    paper_size VARCHAR(20) DEFAULT 'A4',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id)
);

-- Sample templates
INSERT INTO prescription_layout_templates (name, description, template_type, layout_config) VALUES
('Classic', 'Traditional prescription layout', 'system', '{"header": {"show_logo": true}}'::jsonb),
('Modern', 'Contemporary design', 'system', '{"header": {"gradient_bg": true}}'::jsonb),
('Minimal', 'Simple and clean', 'system', '{"header": {"show_logo": false}}'::jsonb)
ON CONFLICT DO NOTHING;

UPDATE prescription_layout_templates SET is_default = true WHERE name = 'Classic';
        `,

        '03_lab_tests.sql': `
-- Lab Test Ordering (Standalone)
CREATE TABLE IF NOT EXISTS lab_tests (
    id SERIAL PRIMARY KEY,
    test_code VARCHAR(50) UNIQUE NOT NULL,
    test_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discounted_price DECIMAL(10, 2),
    fasting_required BOOLEAN DEFAULT false,
    sample_type VARCHAR(100),
    preparation_instructions TEXT,
    tat_hours INTEGER DEFAULT 24,
    urgent_tat_hours INTEGER,
    is_panel BOOLEAN DEFAULT false,
    panel_tests JSONB,
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_id INTEGER,
    ordered_tests JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'routine',
    scheduled_date DATE,
    scheduled_time TIME,
    collection_date TIMESTAMP,
    results_available BOOLEAN DEFAULT false,
    results_file_url TEXT,
    results_data JSONB,
    result_summary TEXT,
    abnormal_flags JSONB,
    clinical_notes TEXT,
    patient_symptoms TEXT,
    lab_name VARCHAR(200),
    lab_technician_id INTEGER,
    verified_by INTEGER,
    verified_at TIMESTAMP,
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    payment_id INTEGER,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_test_results (
    id SERIAL PRIMARY KEY,
    lab_order_id INTEGER NOT NULL,
    test_id INTEGER,
    test_name VARCHAR(200) NOT NULL,
    parameter_name VARCHAR(200),
    result_value VARCHAR(500),
    unit VARCHAR(50),
    reference_range VARCHAR(200),
    is_abnormal BOOLEAN DEFAULT false,
    abnormal_flag VARCHAR(20),
    interpretation TEXT,
    remarks TEXT,
    performed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample lab tests
INSERT INTO lab_tests (test_code, test_name, category, price, sample_type, is_popular) VALUES
('CBC', 'Complete Blood Count', 'Hematology', 300.00, 'Blood', true),
('FBS', 'Fasting Blood Sugar', 'Biochemistry', 150.00, 'Blood', true),
('HBA1C', 'HbA1c', 'Biochemistry', 800.00, 'Blood', true),
('LFT', 'Liver Function Test', 'Biochemistry', 600.00, 'Blood', true),
('RFT', 'Renal Function Test', 'Biochemistry', 600.00, 'Blood', true),
('LIPID', 'Lipid Profile', 'Biochemistry', 700.00, 'Blood', true),
('TSH', 'Thyroid Stimulating Hormone', 'Biochemistry', 400.00, 'Blood', true),
('URINE', 'Urine R/M', 'Microbiology', 200.00, 'Urine', true),
('XRAY_CHEST', 'Chest X-Ray', 'Radiology', 400.00, 'Imaging', true),
('ECG', 'Electrocardiogram', 'Cardiology', 300.00, 'Physical', true)
ON CONFLICT (test_code) DO NOTHING;
        `,

        '04_data_migration.sql': `
-- Data Migration Tools (Standalone)
CREATE TABLE IF NOT EXISTS import_jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(100) UNIQUE NOT NULL,
    import_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_size INTEGER,
    total_rows INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    mode VARCHAR(20) DEFAULT 'live',
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    skipped_rows INTEGER DEFAULT 0,
    error_log JSONB,
    validation_errors JSONB,
    warnings JSONB,
    field_mapping JSONB,
    imported_by INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_log_details (
    id SERIAL PRIMARY KEY,
    import_job_id INTEGER NOT NULL,
    row_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    original_data JSONB,
    processed_data JSONB,
    created_record_id INTEGER,
    error_message TEXT,
    validation_errors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_field_mapping_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    import_type VARCHAR(50) NOT NULL,
    description TEXT,
    field_mappings JSONB NOT NULL,
    transformation_rules JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample mapping templates
INSERT INTO import_field_mapping_templates (template_name, import_type, description, field_mappings) VALUES
('Standard Patient Import', 'patients', 'Standard patient CSV import', 
 '[{"csv_column": "Name", "db_field": "name", "required": true}]'::jsonb),
('Standard Doctor Import', 'doctors', 'Standard doctor CSV import',
 '[{"csv_column": "Name", "db_field": "name", "required": true}]'::jsonb)
ON CONFLICT DO NOTHING;
        `
    };

    return migrations;
};

async function deploy() {
    console.log('🚀 Deploying Phase 1 (Standalone Version)\n');

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        const migrations = createStandaloneMigrations();
        const migrationNames = Object.keys(migrations);

        for (let i = 0; i < migrationNames.length; i++) {
            const name = migrationNames[i];
            const sql = migrations[name];

            console.log(`[${i + 1}/${migrationNames.length}] ${name}...`);
            const start = Date.now();

            await client.query(sql);

            const duration = ((Date.now() - start) / 1000).toFixed(2);
            console.log(`✅ Completed in ${duration}s\n`);
        }

        // Verify
        console.log('🔍 Verification:\n');

        const tables = await client.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN (
              'appointment_activity_log',
              'prescription_layout_templates',
              'doctor_prescription_preferences',
              'lab_tests',
              'lab_orders',
              'lab_test_results',
              'import_jobs',
              'import_log_details',
              'import_field_mapping_templates'
            )
            ORDER BY tablename
        `);

        console.log(`✅ ${tables.rows.length}/9 tables created:`);
        tables.rows.forEach(row => console.log(`   ✓ ${row.tablename}`));

        // Check data
        const templates = await client.query('SELECT COUNT(*) FROM prescription_layout_templates');
        const tests = await client.query('SELECT COUNT(*) FROM lab_tests');

        console.log(`\n📊 Sample data:`);
        console.log(`   ✓ ${templates.rows[0].count} prescription templates`);
        console.log(`   ✓ ${tests.rows[0].count} lab tests`);

        console.log('\n🎉 Phase 1 deployed successfully!');
        console.log('\n📌 Next: Restart backend server (Ctrl+C, then npm run dev)');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

deploy();
