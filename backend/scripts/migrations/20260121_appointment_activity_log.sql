-- Phase 1: Appointment Activity History
-- Track all actions performed on appointments for audit trail

-- 1. Appointment Activity Log Table
CREATE TABLE IF NOT EXISTS appointment_activity_log (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL, -- Removed FK constraint
    user_id INTEGER, -- Removed FK constraint
    action_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'cancelled', 'rescheduled', 'completed', 'no_show', 'payment_received', etc.
    action_description TEXT, -- Detailed description
    old_values JSONB, -- Previous state (for updates)
    new_values JSONB, -- New state (for updates)
    ip_address VARCHAR(45), -- Track IP for security
    user_agent TEXT, -- Browser/device info
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Indexes for performance
CREATE INDEX idx_activity_log_appointment ON appointment_activity_log(appointment_id);
CREATE INDEX idx_activity_log_user ON appointment_activity_log(user_id);
CREATE INDEX idx_activity_log_action_type ON appointment_activity_log(action_type);
CREATE INDEX idx_activity_log_created_at ON appointment_activity_log(created_at DESC);

-- 3. View for human-readable activity
CREATE OR REPLACE VIEW appointment_activity_view AS
SELECT 
    aal.id,
    aal.appointment_id,
    a.appointment_date,
    a.appointment_time,
    p.name as patient_name,
    d.name as doctor_name,
    u.name as performed_by,
    u.role as performed_by_role,
    aal.action_type,
    aal.action_description,
    aal.old_values,
    aal.new_values,
    aal.created_at
FROM appointment_activity_log aal
JOIN appointments a ON aal.appointment_id = a.id
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN users u ON aal.user_id = u.id
ORDER BY aal.created_at DESC;

-- 4. Function to log appointment activity
CREATE OR REPLACE FUNCTION log_appointment_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- On INSERT (new appointment created)
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO appointment_activity_log (
            appointment_id,
            user_id,
            action_type,
            action_description,
            new_values
        ) VALUES (
            NEW.id,
            NEW.created_by,
            'created',
            'Appointment created',
            row_to_json(NEW)::jsonb
        );
        RETURN NEW;
    
    -- On UPDATE (appointment modified)
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Detect what changed
        DECLARE
            action_desc TEXT := 'Appointment updated';
        BEGIN
            IF (OLD.status != NEW.status) THEN
                action_desc := 'Status changed from ' || OLD.status || ' to ' || NEW.status;
            ELSIF (OLD.appointment_date != NEW.appointment_date OR OLD.appointment_time != NEW.appointment_time) THEN
                action_desc := 'Rescheduled from ' || OLD.appointment_date || ' ' || OLD.appointment_time || ' to ' || NEW.appointment_date || ' ' || NEW.appointment_time;
            END IF;
            
            INSERT INTO appointment_activity_log (
                appointment_id,
                user_id,
                action_type,
                action_description,
                old_values,
                new_values
            ) VALUES (
                NEW.id,
                COALESCE(NEW.updated_by, NEW.created_by),
                CASE 
                    WHEN OLD.status != NEW.status THEN 'status_changed'
                    WHEN OLD.appointment_date != NEW.appointment_date THEN 'rescheduled'
                    ELSE 'updated'
                END,
                action_desc,
                row_to_json(OLD)::jsonb,
                row_to_json(NEW)::jsonb
            );
        END;
        RETURN NEW;
    
    -- On DELETE (shouldn't happen often, but log it)
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO appointment_activity_log (
            appointment_id,
            user_id,
            action_type,
            action_description,
            old_values
        ) VALUES (
            OLD.id,
            OLD.created_by,
            'deleted',
            'Appointment deleted',
            row_to_json(OLD)::jsonb
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger on appointments table
DROP TRIGGER IF EXISTS appointment_activity_trigger ON appointments;
CREATE TRIGGER appointment_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION log_appointment_activity();

-- 6. Add columns to appointments table if not exists (for tracking who did what)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'created_by') THEN
        ALTER TABLE appointments ADD COLUMN created_by INTEGER REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'updated_by') THEN
        ALTER TABLE appointments ADD COLUMN updated_by INTEGER REFERENCES users(id);
    END IF;
END $$;

-- 7. Manual activity logging function (for explicit actions like payments, notes)
CREATE OR REPLACE FUNCTION create_appointment_activity(
    p_appointment_id INTEGER,
    p_user_id INTEGER,
    p_action_type VARCHAR(50),
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER AS $$
DECLARE
    new_id INTEGER;
BEGIN
    INSERT INTO appointment_activity_log (
        appointment_id,
        user_id,
        action_type,
        action_description,
        new_values
    ) VALUES (
        p_appointment_id,
        p_user_id,
        p_action_type,
        p_description,
        p_metadata
    ) RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Sample data for testing (optional - comment out in production)
-- INSERT INTO appointment_activity_log (appointment_id, user_id, action_type, action_description)
-- VALUES (1, 1, 'payment_received', 'Payment of ₹500 received via cash');

COMMENT ON TABLE appointment_activity_log IS 'Audit trail for all appointment-related activities';
COMMENT ON COLUMN appointment_activity_log.action_type IS 'Type of action: created, updated, cancelled, rescheduled, completed, no_show, payment_received, note_added, etc.';
COMMENT ON COLUMN appointment_activity_log.old_values IS 'JSON snapshot of previous state (for updates)';
COMMENT ON COLUMN appointment_activity_log.new_values IS 'JSON snapshot of new state';
