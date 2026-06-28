-- Phase 1 Feature 4: Data Migration Tools
-- Enable bulk import of data from CSV/Excel files

-- 1. Import Jobs Table (Track import operations)
CREATE TABLE IF NOT EXISTS import_jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(100) UNIQUE NOT NULL, -- Unique identifier for this import
    
    -- Import details
    import_type VARCHAR(50) NOT NULL, -- 'patients', 'doctors', 'appointments', 'prescriptions'
    file_name VARCHAR(500) NOT NULL,
    file_size INTEGER,
    total_rows INTEGER DEFAULT 0,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    mode VARCHAR(20) DEFAULT 'live', -- 'dry-run' or 'live'
    
    -- Results
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    skipped_rows INTEGER DEFAULT 0,
    
    -- Errors and validation
    error_log JSONB, -- Array of errors
    validation_errors JSONB, -- Field-level validation errors
    warnings JSONB,
    
    -- Mapping configuration
    field_mapping JSON B, -- How CSV columns map to database fields
    -- Example: {"csv_column": "Full Name", "db_field": "name", "required": true}
    
    -- Metadata
    imported_by INTEGER REFERENCES users(id),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Import Log Details (Individual row results)
CREATE TABLE IF NOT EXISTS import_log_details (
    id SERIAL PRIMARY KEY,
    import_job_id INTEGER NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
    
    row_number INTEGER NOT NULL, -- CSV row number
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'skipped'
    
    -- Data
    original_data JSONB, -- Raw CSV data for this row
    processed_data JSONB, -- After mapping and transformation
    
    -- Result
    created_record_id INTEGER, -- ID of created record (if successful)
    error_message TEXT,
    validation_errors JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_jobs_type ON import_jobs(import_type);
CREATE INDEX idx_import_jobs_user ON import_jobs(imported_by);
CREATE INDEX idx_import_log_job ON import_log_details(import_job_id);

-- 4. Function to create import job
CREATE OR REPLACE FUNCTION create_import_job(
    p_import_type VARCHAR,
    p_file_name VARCHAR,
    p_file_size INTEGER,
    p_total_rows INTEGER,
    p_imported_by INTEGER,
    p_mode VARCHAR DEFAULT 'live'
)
RETURNS VARCHAR AS $$
DECLARE
    new_job_id VARCHAR;
BEGIN
    new_job_id := 'IMP-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD-HH24MISS') || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6);
    
    INSERT INTO import_jobs (
        job_id, import_type, file_name, file_size, total_rows, imported_by, mode, status, started_at
    ) VALUES (
        new_job_id, p_import_type, p_file_name, p_file_size, p_total_rows, p_imported_by, p_mode, 'processing', CURRENT_TIMESTAMP
    );
    
    RETURN new_job_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to update import job status
CREATE OR REPLACE FUNCTION update_import_job_status(
    p_job_id VARCHAR,
    p_status VARCHAR,
    p_successful INTEGER DEFAULT 0,
    p_failed INTEGER DEFAULT 0,
    p_skipped INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    UPDATE import_jobs
    SET 
        status = p_status,
        successful_imports = successful_imports + p_successful,
        failed_imports = failed_imports + p_failed,
        skipped_rows = skipped_rows + p_skipped,
        completed_at = CASE WHEN p_status IN ('completed', 'failed', 'cancelled') THEN CURRENT_TIMESTAMP ELSE completed_at END
    WHERE job_id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Sample field mapping templates (for common imports)
CREATE TABLE IF NOT EXISTS import_field_mapping_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    import_type VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Mapping configuration
    field_mappings JSONB NOT NULL,
    -- Example for patients:
    -- [
    --   {"csv_column": "Name", "db_field": "name", "required": true, "data_type": "string"},
    --   {"csv_column": "Email", "db_field": "email", "required": false, "data_type": "email"},
    --   {"csv_column": "Phone", "db_field": "phone", "required": true, "data_type": "phone"}
    -- ]
    
    -- Data transformation rules
    transformation_rules JSONB,
    -- Example:
    -- {
    --   "date_format": "DD/MM/YYYY",
    --   "phone_prefix": "+91",
    --   "default_values": {"status": "active"}
    -- }
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Insert sample mapping templates
INSERT INTO import_field_mapping_templates (template_name, import_type, description, field_mappings, transformation_rules) VALUES
(
    'Standard Patient Import',
    'patients',
    'Standard template for importing patient data from CSV',
    '[
        {"csv_column": "Name", "db_field": "name", "required": true, "data_type": "string"},
        {"csv_column": "Email", "db_field": "email", "required": false, "data_type": "email"},
        {"csv_column": "Phone", "db_field": "phone", "required": true, "data_type": "phone"},
        {"csv_column": "Date of Birth", "db_field": "date_of_birth", "required": false, "data_type": "date"},
        {"csv_column": "Gender", "db_field": "gender", "required": false, "data_type": "enum", "allowed_values": ["male", "female", "other"]},
        {"csv_column": "Address", "db_field": "address", "required": false, "data_type": "text"},
        {"csv_column": "Blood Group", "db_field": "blood_group", "required": false, "data_type": "string"}
    ]'::jsonb,
    '{
        "date_format": "DD/MM/YYYY",
        "phone_prefix": "+91",
        "default_values": {"created_at": "now()"}
    }'::jsonb
),
(
    'Standard Doctor Import',
    'doctors',
    'Standard template for importing doctor data from CSV',
    '[
        {"csv_column": "Name", "db_field": "name", "required": true, "data_type": "string"},
        {"csv_column": "Email", "db_field": "email", "required": true, "data_type": "email"},
        {"csv_column": "Phone", "db_field": "phone", "required": true, "data_type": "phone"},
        {"csv_column": "Specialization", "db_field": "specialization", "required": true, "data_type": "string"},
        {"csv_column": "Qualification", "db_field": "qualification", "required": false, "data_type": "string"},
        {"csv_column": "Experience", "db_field": "experience_years", "required": false, "data_type": "number"},
        {"csv_column": "Consultation Fee", "db_field": "consultation_fee", "required": false, "data_type": "number"},
        {"csv_column": "Registration Number", "db_field": "registration_number", "required": false, "data_type": "string"}
    ]'::jsonb,
    '{
        "default_values": {"status": "active", "is_available": true}
    }'::jsonb
);

-- 8. View for import job summary
CREATE OR REPLACE VIEW import_jobs_summary AS
SELECT 
    ij.job_id,
    ij.import_type,
    ij.file_name,
    ij.status,
    ij.mode,
    ij.total_rows,
    ij.successful_imports,
    ij.failed_imports,
    ij.skipped_rows,
    ROUND((ij.successful_imports::DECIMAL / NULLIF(ij.total_rows, 0)) * 100, 2) as success_rate,
    u.name as imported_by_name,
    ij.started_at,
    ij.completed_at,
    EXTRACT(EPOCH FROM (COALESCE(ij.completed_at, CURRENT_TIMESTAMP) - ij.started_at)) as duration_seconds
FROM import_jobs ij
LEFT JOIN users u ON ij.imported_by = u.id
ORDER BY ij.created_at DESC;

COMMENT ON TABLE import_jobs IS 'Track bulk data import operations';
COMMENT ON TABLE import_log_details IS 'Detailed log for each row in an import job';
COMMENT ON TABLE import_field_mapping_templates IS 'Reusable templates for field mapping configurations';
COMMENT ON COLUMN import_jobs.mode IS 'dry-run: validation only, live: actual import';
COMMENT ON COLUMN import_jobs.field_mapping IS 'How CSV columns map to database fields';
