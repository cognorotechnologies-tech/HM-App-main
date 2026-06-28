/* eslint-disable @typescript-eslint/no-unused-vars */
 

// Stubbed permissionService to remove Supabase dependencies
import type { Feature, PermissionMatrix, UserRole, NewFeature, UpdatePermission } from '../types/rbac';

class PermissionService {
    async hasPermission(userId: string, featureName: string, action: string = 'view'): Promise<boolean> {
        console.warn('Backend: permissionService.hasPermission not implemented. Allowing by default for dev.');
        return true;
    }

    async getUserFeatures(userId: string): Promise<Feature[]> {
        console.warn('Backend: permissionService.getUserFeatures not implemented');
        return [];
    }

    async getPermissionMatrix(): Promise<PermissionMatrix> {
        console.warn('Backend: permissionService.getPermissionMatrix not implemented');
        return { features: [], roles: [] };
    }

    async updateRolePermission(role: UserRole, featureId: string, permissions: UpdatePermission): Promise<boolean> {
        console.warn('Backend: permissionService.updateRolePermission not implemented');
        return true;
    }

    async createFeature(feature: NewFeature): Promise<Feature | null> {
        console.warn('Backend: permissionService.createFeature not implemented');
        return {
            id: 'mock-feature',
            is_system: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sort_order: 0,
            description: feature.description || '',
            icon_name: feature.icon_name || null,
            route: feature.route || null,
            ...feature
        };
    }

    async updateFeature(featureId: string, updates: Partial<Feature>): Promise<boolean> {
        console.warn('Backend: permissionService.updateFeature not implemented');
        return true;
    }

    async toggleFeature(featureId: string, isActive: boolean): Promise<boolean> {
        console.warn('Backend: permissionService.toggleFeature not implemented');
        return true;
    }

    async deleteFeature(featureId: string): Promise<boolean> {
        console.warn('Backend: permissionService.deleteFeature not implemented');
        return true;
    }

    async getFeaturesByCategory(): Promise<Record<string, Feature[]>> {
        console.warn('Backend: permissionService.getFeaturesByCategory not implemented');
        return {};
    }
}

export const permissionService = new PermissionService();
