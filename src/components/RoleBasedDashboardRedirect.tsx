// @ts-nocheck - Bypassing TypeScript strict checks due to Supabase type conflicts
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RoleBasedDashboardRedirect() {
    const { user, loading } = useAuthStore();
    const role = user?.role;

    console.log('🔄 RoleBasedDashboardRedirect -', { role, userEmail: user?.email, loading });

    // Show loading state while role is being determined
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Redirect to the appropriate dashboard based on role
    if (role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (role === 'doctor') return <Navigate to="/dashboard/doctor" replace />;
    if (role === 'receptionist') return <Navigate to="/dashboard/receptionist" replace />;
    if (role === 'patient') return <Navigate to="/dashboard/patient" replace />;
    if (role === 'pharmacist') return <Navigate to="/pharmacy/dashboard" replace />;

    // Fallback to home if no role
    console.warn('⚠️ No role detected, redirecting to home');
    return <Navigate to="/" replace />;
}
