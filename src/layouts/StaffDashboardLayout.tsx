import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StaffHeader from '../components/StaffHeader';
import StaffSidebar from '../components/StaffSidebar';
import { useAuthStore } from '../store/authStore';
import WorkflowAutomationRunner from '../components/WorkflowAutomationRunner';

export default function StaffDashboardLayout() {
    const { loading } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <WorkflowAutomationRunner />

            {/* Sidebar */}
            <StaffSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <StaffHeader onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 pb-20">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

