import { Link } from 'react-router-dom';
import { Calendar, FileText, Activity, Users, Receipt } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import AppointmentList from './AppointmentList';

export default function PatientDashboard() {
    const { user } = useAuthStore();
    const profile = (useAuthStore.getState() as any).profile || null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>
            <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Welcome, {profile?.first_name || user?.email}</h2>
                    <p className="text-gray-600">Manage your appointments and view medical history.</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Link
                        to="/dashboard/patient/book"
                        className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <Calendar className="w-12 h-12" />
                            <div>
                                <h3 className="text-xl font-semibold">Book Appointment</h3>
                                <p className="text-blue-100">Schedule a new appointment</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/patient/documents"
                        className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <FileText className="w-12 h-12" />
                            <div>
                                <h3 className="text-xl font-semibold">Medical Documents</h3>
                                <p className="text-green-100">Upload & manage your documents</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/patient/health"
                        className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <Activity className="w-12 h-12" />
                            <div>
                                <h3 className="text-xl font-semibold">Health Tracking</h3>
                                <p className="text-purple-100">Track vitals & health metrics</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/patient/family"
                        className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <Users className="w-12 h-12" />
                            <div>
                                <h3 className="text-xl font-semibold">Family Management</h3>
                                <p className="text-orange-100">Manage family members</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/dashboard/patient/billing"
                        className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <Receipt className="w-12 h-12" />
                            <div>
                                <h3 className="text-xl font-semibold">Billing</h3>
                                <p className="text-pink-100">View invoices & payments</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <AppointmentList />
            </div>
        </div>
    );
}
