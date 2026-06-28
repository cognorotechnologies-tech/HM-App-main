-- RBAC System: Features and Role Permissions
-- This migration creates the foundation for Role-Based Access Control

-- 1. Create features table
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'core', 'medical', 'admin', 'reports', 'communication', 'automation'
    icon_name VARCHAR(50), -- Lucide icon name
    route VARCHAR(200), -- App route if applicable
    is_system BOOLEAN DEFAULT false, -- System features can't be deleted
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(50) NOT NULL, -- 'admin', 'doctor', 'nurse', 'receptionist', 'patient'
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT true,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    custom_permissions JSONB, -- For feature-specific permissions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, feature_id)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_features_category ON features(category);
CREATE INDEX IF NOT EXISTS idx_features_is_active ON features(is_active);
CREATE INDEX IF NOT EXISTS idx_features_name ON features(name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_feature ON role_permissions(feature_id);

-- 4. Create updated_at trigger for features
CREATE OR REPLACE FUNCTION update_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_features_updated_at
    BEFORE UPDATE ON features
    FOR EACH ROW
    EXECUTE FUNCTION update_features_updated_at();

-- 5. Seed default system features
INSERT INTO features (name, display_name, description, category, icon_name, route, is_system, sort_order) VALUES
-- Core Features (1-10)
('dashboard', 'Dashboard', 'Main dashboard and overview', 'core', 'LayoutDashboard', '/dashboard', true, 1),
('analytics', 'Analytics & Reports', 'View system analytics and reports', 'reports', 'BarChart', '/dashboard/analytics', true, 2),

-- Patient Management (11-20)
('patients_view', 'View Patients', 'View patient list and details', 'medical', 'Users', '/dashboard/patients', true, 11),
('patients_create', 'Create Patients', 'Register new patients', 'medical', 'UserPlus', '/dashboard/patients/new', true, 12),
('patients_edit', 'Edit Patients', 'Modify patient information', 'medical', 'Edit', null, true, 13),
('patients_delete', 'Delete Patients', 'Remove patient records', 'medical', 'Trash2', null, true, 14),
('patient_health_journey', 'Patient Health Journey', 'View patient health timeline', 'medical', 'Activity', null, true, 15),

-- Appointment Management (21-30)
('appointments_view', 'View Appointments', 'View appointment schedule', 'medical', 'Calendar', '/dashboard/appointments', true, 21),
('appointments_create', 'Create Appointments', 'Schedule new appointments', 'medical', 'CalendarPlus', null, true, 22),
('appointments_edit', 'Edit Appointments', 'Modify existing appointments', 'medical', 'CalendarCheck', null, true, 23),
('appointments_delete', 'Cancel Appointments', 'Cancel or delete appointments', 'medical', 'CalendarX', null, true, 24),

-- Doctor Management (31-40)
('doctors_view', 'View Doctors', 'View doctor list and profiles', 'admin', 'Stethoscope', '/dashboard/admin/doctors', true, 31),
('doctors_manage', 'Manage Doctors', 'Add, edit, or remove doctors', 'admin', 'UserCog', null, true, 32),

-- Department Management (41-50)
('departments_view', 'View Departments', 'View department information', 'admin', 'Building2', '/dashboard/admin/departments', true, 41),
('departments_manage', 'Manage Departments', 'Add, edit, or remove departments', 'admin', 'Settings', null, true, 42),

-- Campaign & Communication (51-60)
('campaigns_view', 'View Campaigns', 'View marketing campaigns', 'communication', 'Mail', '/dashboard/admin/campaigns', true, 51),
('campaigns_create', 'Create Campaigns', 'Create new campaigns', 'communication', 'MailPlus', null, false, 52),
('campaigns_manage', 'Manage Campaigns', 'Edit or delete campaigns', 'communication', 'MailEdit', null, false, 53),
('whatsapp_templates', 'WhatsApp Templates', 'Manage WhatsApp message templates', 'communication', 'MessageSquare', '/dashboard/admin/whatsapp/templates', false, 54),
('surveys', 'Surveys', 'Create and manage surveys', 'communication', 'ClipboardList', '/dashboard/admin/surveys', false, 55),

-- Workflow Automation (61-70)
('workflows_view', 'View Workflows', 'View automated workflows', 'automation', 'GitBranch', '/dashboard/admin/workflows', false, 61),
('workflows_manage', 'Manage Workflows', 'Create and edit workflows', 'automation', 'Workflow', null, false, 62),

-- Staff Management (71-80)
('staff_tasks', 'Staff Tasks', 'Manage staff task assignments', 'admin', 'CheckSquare', '/dashboard/admin/tasks', true, 71),
('user_management', 'User Management', 'Manage system users and roles', 'admin', 'Users', '/dashboard/admin/users', true, 72),
('nurse_management', 'Nurse Management', 'Manage nursing staff', 'admin', 'Activity', '/dashboard/admin/nurses', true, 73),
('receptionist_management', 'Receptionist Management', 'Manage reception staff', 'admin', 'UserSquare', '/dashboard/admin/receptionists', true, 74),

-- Monitoring & Logs (81-90)
('nurse_monitoring', 'Nurse Monitoring Dashboard', 'Real-time patient monitoring', 'medical', 'Monitor', '/dashboard/nurse', true, 81),
('system_logs', 'System Logs', 'View system activity logs', 'admin', 'FileText', null, false, 82),

-- Permissions (91-100)
('permission_management', 'Permission Management', 'Configure role-based permissions', 'admin', 'Shield', '/dashboard/admin/permissions', true, 91)

ON CONFLICT (name) DO NOTHING;

-- 6. Seed Admin role permissions (full access)
INSERT INTO role_permissions (role, feature_id, can_view, can_create, can_edit, can_delete)
SELECT 'admin', id, true, true, true, true
FROM features
ON CONFLICT (role, feature_id) DO NOTHING;

-- 7. Seed Doctor role permissions
INSERT INTO role_permissions (role, feature_id, can_view, can_create, can_edit, can_delete)
SELECT 'doctor', id, 
    true,
    CASE WHEN name IN ('patients_create', 'appointments_create') THEN true ELSE false END,
    CASE WHEN name IN ('patients_edit', 'appointments_edit', 'patient_health_journey') THEN true ELSE false END,
    false
FROM features
WHERE name IN (
    'dashboard', 'analytics',
    'patients_view', 'patients_create', 'patients_edit', 'patient_health_journey',
    'appointments_view', 'appointments_create', 'appointments_edit',
    'doctors_view', 'departments_view'
)
ON CONFLICT (role, feature_id) DO NOTHING;

-- 8. Seed Nurse role permissions
INSERT INTO role_permissions (role, feature_id, can_view, can_create, can_edit, can_delete)
SELECT 'nurse', id,
    true,
    CASE WHEN name = 'appointments_create' THEN true ELSE false END,
    CASE WHEN name IN ('patients_edit', 'appointments_edit', 'nurse_monitoring') THEN true ELSE false END,
    false
FROM features
WHERE name IN (
    'dashboard',
    'patients_view', 'patients_edit', 'patient_health_journey',
    'appointments_view', 'appointments_create', 'appointments_edit',
    'nurse_monitoring', 'doctors_view'
)
ON CONFLICT (role, feature_id) DO NOTHING;

-- 9. Seed Receptionist role permissions
INSERT INTO role_permissions (role, feature_id, can_view, can_create, can_edit, can_delete)
SELECT 'receptionist', id,
    true,
    CASE WHEN name IN ('patients_create', 'appointments_create') THEN true ELSE false END,
    CASE WHEN name IN ('patients_edit', 'appointments_edit') THEN true ELSE false END,
    false
FROM features
WHERE name IN (
    'dashboard',
    'patients_view', 'patients_create', 'patients_edit',
    'appointments_view', 'appointments_create', 'appointments_edit',
    'doctors_view', 'departments_view'
)
ON CONFLICT (role, feature_id) DO NOTHING;

-- 10. Seed Patient role permissions
INSERT INTO role_permissions (role, feature_id, can_view, can_create, can_edit, can_delete)
SELECT 'patient', id,
    true,
    CASE WHEN name = 'appointments_create' THEN true ELSE false END,
    false,
    false
FROM features
WHERE name IN (
    'dashboard',
    'appointments_view', 'appointments_create',
    'patient_health_journey'
)
ON CONFLICT (role, feature_id) DO NOTHING;

-- 11. Enable RLS
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies for features
CREATE POLICY "Anyone can view active features"
    ON features FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Admins can manage features"
    ON features FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 13. RLS Policies for role_permissions
CREATE POLICY "Users can view their role permissions"
    ON role_permissions FOR SELECT
    TO authenticated
    USING (
        role = (SELECT role FROM profiles WHERE id = auth.uid())
        OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage role permissions"
    ON role_permissions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 14. Add comments
COMMENT ON TABLE features IS 'System features and custom features that can be permission-controlled';
COMMENT ON TABLE role_permissions IS 'Permissions mapping for each role to access specific features';
COMMENT ON COLUMN features.is_system IS 'System features cannot be deleted, only disabled';
COMMENT ON COLUMN role_permissions.custom_permissions IS 'JSON object for feature-specific permission settings';
