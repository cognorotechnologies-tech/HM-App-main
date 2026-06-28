import { useState, useEffect, useCallback } from 'react';
import { permissionService } from '../services/permissionService';
import { useAuthStore } from '../store/authStore';
import type { Feature, PermissionAction } from '../types/rbac';

export function usePermissions() {
    const { user } = useAuthStore();
    const role = user?.role;
    const [userFeatures, setUserFeatures] = useState<Feature[]>([]);
    const [loading, setLoading] = useState(true);

    // Load user's accessible features
    useEffect(() => {
        if (!user?.id) {
            setUserFeatures([]);
            setLoading(false);
            return;
        }

        permissionService.getUserFeatures(user.id)
            .then(features => {
                setUserFeatures(features);
                setLoading(false);
            })
            .catch(() => {
                setUserFeatures([]);
                setLoading(false);
            });
    }, [user?.id]);

    /**
     * Check if user has permission for a feature and action
     */
    const hasPermission = useCallback(
        async (featureName: string, action: PermissionAction = 'view'): Promise<boolean> => {
            if (!user?.id) return false;

            // Quick check for admin
            if (role === 'admin') return true;

            return await permissionService.hasPermission(user.id, featureName, action);
        },
        [user?.id, role]
    );

    /**
     * Synchronous check if feature is in user's feature list (view permission only)
     */
    const canView = useCallback(
        (featureName: string): boolean => {
            if (role === 'admin') return true;
            return userFeatures.some(f => f.name === featureName);
        },
        [userFeatures, role]
    );

    /**
     * Check if user can create (async)
     */
    const canCreate = useCallback(
        async (featureName: string): Promise<boolean> => {
            return await hasPermission(featureName, 'create');
        },
        [hasPermission]
    );

    /**
     * Check if user can edit (async)
     */
    const canEdit = useCallback(
        async (featureName: string): Promise<boolean> => {
            return await hasPermission(featureName, 'edit');
        },
        [hasPermission]
    );

    /**
     * Check if user can delete (async)
     */
    const canDelete = useCallback(
        async (featureName: string): Promise<boolean> => {
            return await hasPermission(featureName, 'delete');
        },
        [hasPermission]
    );

    /**
     * Get feature by name
     */
    const getFeature = useCallback(
        (featureName: string): Feature | undefined => {
            return userFeatures.find(f => f.name === featureName);
        },
        [userFeatures]
    );

    return {
        userFeatures,
        loading,
        hasPermission,
        canView,
        canCreate,
        canEdit,
        canDelete,
        getFeature
    };
}
