import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StatsCard from '../../components/StatsCard';
import ActivityFeed from '../../components/ActivityFeed';
import { adminService } from '../../services/adminService';
import {
    Users, Stethoscope, Calendar, Building2, Settings,
    Receipt, Mail, TrendingUp, UserPlus, Plus, AlertTriangle, GitBranch, CheckSquare
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        todayAppointments: 0,
        totalDepartments: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    async function fetchDashboardStats() {
        try {
            const data = await adminService.getDashboardStats();
            setStats({
                totalPatients: data.patients,
                totalDoctors: data.doctors,
                todayAppointments: data.appointments,
                totalDepartments: data.departments,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }

    const managementCards = [
        {
            title: 'Doctors',
            description: 'Onboard new doctors, manage profiles, and assignments',
            icon: Stethoscope,
            link: '/dashboard/admin/doctors',
            gradient: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            title: 'Departments',
            description: 'Add new departments, update descriptions, or remove services',
            icon: Building2,
            link: '/dashboard/admin/departments',
            gradient: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        {
            title: 'Patients',
            description: 'View patient registry and medical history records',
            icon: Users,
            link: '/dashboard/admin/patients',
            gradient: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        {
            title: 'Appointments',
            description: 'Monitor all hospital appointments and status',
            icon: Calendar,
            link: '/dashboard/admin/appointments',
            gradient: 'from-orange-500 to-orange-600',
            bgLight: 'bg-orange-50',
            borderColor: 'border-orange-200'
        },
        {
            title: 'Campaign Management',
            description: 'Create and manage email/SMS marketing campaigns',
            icon: Mail,
            link: '/dashboard/admin/campaigns',
            gradient: 'from-pink-500 to-pink-600',
            bgLight: 'bg-pink-50',
            borderColor: 'border-pink-200',
            isNew: true
        },
        {
            title: 'Patient Monitoring',
            description: 'Monitor patient alerts and survey responses in real-time',
            icon: AlertTriangle,
            link: '/dashboard/nurse',
            gradient: 'from-red-500 to-red-600',
            bgLight: 'bg-red-50',
            borderColor: 'border-red-200',
            isNew: true
        },
        {
            title: 'Workflow Automation',
            description: 'Design automated care journeys and protocols',
            icon: GitBranch,
            link: '/dashboard/admin/workflows',
            gradient: 'from-teal-500 to-teal-600',
            bgLight: 'bg-teal-50',
            borderColor: 'border-teal-200',
            isNew: true
        },
        {
            title: 'Billing',
            description: 'Manage invoices, payments, and financial records',
            icon: Receipt,
            link: '/dashboard/admin/billing/invoices',
            gradient: 'from-indigo-500 to-indigo-600',
            bgLight: 'bg-indigo-50',
            borderColor: 'border-indigo-200'
        },
        {
            title: 'System Settings',
            description: 'Configure hospital info, templates, and preferences',
            icon: Settings,
            link: '/dashboard/admin/settings',
            gradient: 'from-cyan-500 to-cyan-600',
            bgLight: 'bg-cyan-50',
            borderColor: 'border-cyan-200'
        },
        {
            title: 'Staff Tasks',
            description: 'View pending tasks from automated workflows',
            icon: CheckSquare,
            link: '/dashboard/admin/tasks',
            gradient: 'from-orange-500 to-orange-600',
            bgLight: 'bg-orange-50',
            borderColor: 'border-orange-200',
            isNew: true
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 animate-fadeIn">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Settings className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">System Overview & Management Console</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Patients"
                        value={loading ? '...' : stats.totalPatients.toLocaleString()}
                        icon={<Users className="w-8 h-8" />}
                        gradient="from-blue-500 to-blue-600"
                    />
                    <StatsCard
                        title="Total Doctors"
                        value={loading ? '...' : stats.totalDoctors}
                        icon={<Stethoscope className="w-8 h-8" />}
                        gradient="from-green-500 to-green-600"
                    />
                    <StatsCard
                        title="Today's Appointments"
                        value={loading ? '...' : stats.todayAppointments}
                        icon={<Calendar className="w-8 h-8" />}
                        gradient="from-purple-500 to-purple-600"
                    />
                    <StatsCard
                        title="Departments"
                        value={loading ? '...' : stats.totalDepartments}
                        icon={<Building2 className="w-8 h-8" />}
                        gradient="from-orange-500 to-orange-600"
                    />
                </div>

                {/* Management Cards */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Management Tools</h2>
                        <span className="text-sm text-gray-600">{managementCards.length} modules</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {managementCards.map((card) => {
                            const IconComponent = card.icon;
                            return (
                                <Link
                                    key={card.title}
                                    to={card.link}
                                    className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden animate-slideUp"
                                >
                                    {/* New Badge */}
                                    {card.isNew && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                                                NEW
                                            </span>
                                        </div>
                                    )}

                                    {/* Gradient Header */}
                                    <div className={`bg-gradient-to-r ${card.gradient} p-6`}>
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <IconComponent className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{card.title}</h3>
                                    </div>

                                    {/* Content */}
                                    <div className={`p-6 ${card.bgLight} border-t-2 ${card.borderColor}`}>
                                        <p className="text-gray-700 text-sm">{card.description}</p>
                                        <div className="mt-4 flex items-center text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            <span>Manage</span>
                                            <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-100 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Plus className="w-6 h-6" />
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link
                            to="/dashboard/admin/doctors"
                            className="px-4 py-3 bg-white border-2 border-blue-200 rounded-xl text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all text-center flex items-center justify-center gap-2 shadow-sm hover:shadow"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add Doctor
                        </Link>
                        <Link
                            to="/dashboard/admin/departments"
                            className="px-4 py-3 bg-white border-2 border-green-200 rounded-xl text-green-700 font-semibold hover:bg-green-50 hover:border-green-300 transition-all text-center flex items-center justify-center gap-2 shadow-sm hover:shadow"
                        >
                            <Plus className="w-4 h-4" />
                            Add Department
                        </Link>
                        <Link
                            to="/dashboard/admin/campaigns"
                            className="px-4 py-3 bg-white border-2 border-pink-200 rounded-xl text-pink-700 font-semibold hover:bg-pink-50 hover:border-pink-300 transition-all text-center flex items-center justify-center gap-2 shadow-sm hover:shadow"
                        >
                            <Mail className="w-4 h-4" />
                            New Campaign
                        </Link>
                        <Link
                            to="/dashboard/admin/settings"
                            className="px-4 py-3 bg-white border-2 border-cyan-200 rounded-xl text-cyan-700 font-semibold hover:bg-cyan-50 hover:border-cyan-300 transition-all text-center flex items-center justify-center gap-2 shadow-sm hover:shadow"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}


