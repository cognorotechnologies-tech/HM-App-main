// TypeScript strict checks enabled
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../store/authStore';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
    children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const { user, loading, initialized } = useAuthStore();
    const role = user?.role;
    const location = useLocation();

    if (loading || !initialized) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
        // Smart redirection based on attempted path
        if (location.pathname.startsWith('/dashboard/patient')) {
            return <Navigate to="/login/patient" replace />;
        }
        if (location.pathname.startsWith('/dashboard/doctor')) {
            return <Navigate to="/login/doctor" replace />;
        }
        if (location.pathname.startsWith('/dashboard/admin')) {
            return <Navigate to="/login/admin" replace />;
        }
        if (location.pathname.startsWith('/dashboard/receptionist')) {
            return <Navigate to="/staff/receptionist" replace />;
        }
        if (location.pathname.startsWith('/pharmacy')) {
            return <Navigate to="/staff/pharmacist" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on actual role
        if (role === 'admin') return <Navigate to="/dashboard/admin" replace />;
        if (role === 'doctor') return <Navigate to="/dashboard/doctor" replace />;
        if (role === 'receptionist') return <Navigate to="/dashboard/receptionist" replace />;
        if (role === 'patient') return <Navigate to="/dashboard/patient" replace />;
        if (role === 'pharmacist') return <Navigate to="/pharmacy/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
