// RBAC System Types


/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient' | 'pharmacist';

export type FeatureCategory = 'core' | 'medical' | 'admin' | 'reports' | 'communication' | 'automation';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export interface Feature {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    category: FeatureCategory;
    icon_name: string | null;
    route: string | null;
    is_system: boolean;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface RolePermission {
    id: string;
    role: UserRole;
    feature_id: string;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
    custom_permissions: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}

export interface FeatureWithPermissions extends Feature {
    permissions: {
        [key in UserRole]?: {
            can_view: boolean;
            can_create: boolean;
            can_edit: boolean;
            can_delete: boolean;
        };
    };
}

export interface PermissionMatrix {
    features: FeatureWithPermissions[];
    roles: UserRole[];
}

export interface NewFeature {
    name: string;
    display_name: string;
    description?: string | null;
    category: FeatureCategory;
    icon_name?: string | null;
    route?: string | null;
    is_system?: boolean;
}

export interface UpdatePermission {
    can_view?: boolean;
    can_create?: boolean;
    can_edit?: boolean;
    can_delete?: boolean;
    custom_permissions?: Record<string, any> | null;
}

export interface PermissionCheckResult {
    allowed: boolean;
    reason?: string;
}

// Helper type for permission sets
export type PermissionSet = {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
};
