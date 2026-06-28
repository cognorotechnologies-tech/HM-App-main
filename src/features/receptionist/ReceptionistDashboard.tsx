import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { receptionistService } from '../../services/receptionistService';
import { Users, UserCheck, CalendarCheck, Clock } from 'lucide-react';
import StatCard from '../../components/StatCard';

interface DashboardStats {
    totalPatients: number;
    walkins: number;
    appointments: number;
    pendingConsultations: number;
}

interface DoctorStatus {
    id: string;
    name: string;
    department: string;
    status: 'available' | 'busy' | 'break' | 'offline';
}

export default function ReceptionistDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalPatients: 0,
        walkins: 0,
        appointments: 0,
        pendingConsultations: 0,
    });
    const [doctors, setDoctors] = useState<DoctorStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const fetchDoctors = async () => {
        try {
            const doctorsData = await doctorService.getAll();

            setDoctors(doctorsData.map((doc: any) => ({
                id: doc.id,
                name: `${doc.profiles?.first_name} ${doc.profiles?.last_name}`,
                department: doc.departments?.name || doc.specialization || 'General',
                status: (doc.status as any) || 'offline',
            })));
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    async function fetchDashboardData() {
        try {
            const dashboardStats = await receptionistService.getDashboardStats();

            setStats({
                totalPatients: dashboardStats.totalPatients,
                walkins: dashboardStats.walkins,
                appointments: dashboardStats.appointments,
                pendingConsultations: dashboardStats.pendingConsultations
            });

            await fetchDoctors();

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    const quickActions = [
        {
            title: 'Register New Patient',
            description: 'Walk-in registration',
            icon: '➕',
            link: '/dashboard/receptionist/register',
            color: 'bg-green-50 border-green-200 text-green-700',
        },
        {
            title: 'Search Patient',
            description: 'Find patient records',
            icon: '🔍',
            link: '/dashboard/receptionist/patients',
            color: 'bg-blue-50 border-blue-200 text-blue-700',
        },
        {
            title: 'Queue Management',
            description: 'Manage token queue',
            icon: '📋',
            link: '/dashboard/receptionist/queue',
            color: 'bg-purple-50 border-purple-200 text-purple-700',
        },
        {
            title: 'Prescriptions',
            description: 'Print prescriptions',
            icon: '💊',
            link: '/dashboard/receptionist/prescriptions',
            color: 'bg-pink-50 border-pink-200 text-pink-700',
        },
        {
            title: "Today's Appointments",
            description: 'View scheduled visits',
            icon: '📅',
            link: '/dashboard/receptionist/appointments',
            color: 'bg-orange-50 border-orange-200 text-orange-700',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Reception Desk</h1>
                <p className="text-gray-600 mt-2">OPD Management & Patient Services</p>
            </div>

            {/* Today's Statistics - Enhanced Modern Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Patients"
                    value={stats.totalPatients}
                    icon={Users}
                    gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700"
                    iconBg="bg-blue-800"
                    trend={{
                        value: 12,
                        isPositive: true,
                        label: "vs yesterday"
                    }}
                    onClick={() => navigate('/dashboard/receptionist/patients')}
                />

                <StatCard
                    title="Walk-in Registrations"
                    value={stats.walkins}
                    icon={UserCheck}
                    gradient="bg-gradient-to-br from-green-500 via-green-600 to-green-700"
                    iconBg="bg-green-800"
                    trend={{
                        value: 8,
                        isPositive: true,
                        label: "vs yesterday"
                    }}
                    onClick={() => navigate('/dashboard/receptionist/register')}
                />

                <StatCard
                    title="Appointments"
                    value={stats.appointments}
                    icon={CalendarCheck}
                    gradient="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700"
                    iconBg="bg-purple-800"
                    trend={{
                        value: 0,
                        isPositive: false,
                        label: "vs yesterday"
                    }}
                    onClick={() => navigate('/dashboard/receptionist/appointments')}
                />

                <StatCard
                    title="Pending Consultations"
                    value={stats.pendingConsultations}
                    icon={Clock}
                    gradient="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700"
                    iconBg="bg-orange-800"
                    trend={{
                        value: 5,
                        isPositive: false,
                        label: "needs attention"
                    }}
                    onClick={() => navigate('/dashboard/receptionist/queue')}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {/* Doctor Availability - Left Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Availability</h3>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {doctors.map((doctor) => (
                                    <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-lg">👨‍⚕️</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{doctor.name}</p>
                                                <p className="text-xs text-gray-500">{doctor.department}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${doctor.status === 'available' ? 'bg-green-100 text-green-700' :
                                            doctor.status === 'busy' ? 'bg-red-100 text-red-700' :
                                                doctor.status === 'break' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {doctor.status === 'available' ? '✓ Available' :
                                                doctor.status === 'busy' ? '● Busy' :
                                                    doctor.status === 'break' ? '☕ Break' :
                                                        '✕ Offline'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions - Right Columns */}
                <div className="lg:col-span-2">
                    <div className="grid md:grid-cols-2 gap-6">
                        {quickActions.map((action) => (
                            <Link
                                key={action.title}
                                to={action.link}
                                className={`block p-6 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-[1.02] ${action.color} border-opacity-50 bg-white`}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-4 ${action.color}`}>
                                    {action.icon}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h2>
                                <p className="text-gray-600">{action.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Current Queue Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Current Queue Status</h3>
                    <Link
                        to="/dashboard/receptionist/queue"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View All →
                    </Link>
                </div>

                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">📋 No patients in queue</p>
                    <p className="text-sm">Patients will appear here as they register</p>
                </div>
            </div>

            {/* Emergency Banner */}
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🚨</span>
                    <div>
                        <p className="text-sm font-medium text-red-800">Emergency Priority</p>
                        <p className="text-xs text-red-600">For emergencies, use the priority override in Queue Management</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
