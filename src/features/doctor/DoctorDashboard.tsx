// TypeScript strict checks enabled
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import DoctorAppointments from './DoctorAppointments';
import DoctorCalendar from './DoctorCalendar';
import DoctorQueue from './DoctorQueue';
import { doctorService } from '../../services/doctorService';
import { Calendar, Clock, Users, CheckCircle2, TrendingUp, Activity } from 'lucide-react';

export default function DoctorDashboard() {
    const { user } = useAuthStore();
    const profile = (useAuthStore.getState() as any).profile || null;
    const [status, setStatus] = useState<'available' | 'busy' | 'break' | 'offline'>('offline');
    const [activeTab, setActiveTab] = useState<'appointments' | 'calendar' | 'queue'>('calendar');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayAppointments: 0,
        completedToday: 0,
        totalPatients: 0,
        avgConsultTime: 0
    });

    useEffect(() => {
        if (profile?.id) {
            fetchStatus();
            fetchStats();
        }
    }, [profile?.id]);

    const fetchStatus = async () => {
        try {
            const data = await doctorService.getById(profile?.id);
            if (data) setStatus((data.status as any) || 'offline');
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Refactored to use doctorService
            if (profile?.id) {
                const dashboardStats = await doctorService.getDashboardStats(profile.id);
                setStats({
                    todayAppointments: dashboardStats.todayAppointments,
                    completedToday: dashboardStats.completedToday,
                    totalPatients: dashboardStats.totalPatients,
                    avgConsultTime: 25 // Mock data or from API
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const updateStatus = async (newStatus: 'available' | 'busy' | 'break' | 'offline') => {
        try {
            setStatus(newStatus); // Optimistic update
            await doctorService.update(profile?.id, { status: newStatus });
        } catch (error) {
            console.error('Error updating status:', error);
            fetchStatus();
        }
    };

    const statusConfig = {
        available: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-700',
            dot: 'bg-green-500'
        },
        busy: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-700',
            dot: 'bg-red-500'
        },
        break: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-700',
            dot: 'bg-yellow-500'
        },
        offline: {
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            text: 'text-gray-700',
            dot: 'bg-gray-500'
        }
    };

    const currentStatus = statusConfig[status];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 animate-fadeIn">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        {/* Welcome Section */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Doctor Dashboard
                                </h1>
                                <p className="text-gray-600 mt-1 font-medium">
                                    Welcome back, Dr. {profile?.last_name || user?.email?.split('@')[0]}
                                </p>
                            </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-4 flex-wrap">
                            {/* Status Selector */}
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${currentStatus.bg} ${currentStatus.border} shadow-sm transition-all`}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${currentStatus.dot} animate-pulse`}></div>
                                    <span className="text-sm font-semibold text-gray-700">Status:</span>
                                </div>
                                <select
                                    value={status}
                                    onChange={(e) => updateStatus(e.target.value as any)}
                                    className={`text-sm font-bold rounded-lg border-0 py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-blue-500 ${currentStatus.text} ${currentStatus.bg}`}
                                    disabled={loading}
                                >
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="break">On Break</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>

                            {/* Manage Schedule Button */}
                            <Link to="/dashboard/doctor/schedule">
                                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2">
                                    <Calendar size={18} />
                                    Manage Schedule
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        icon={<Calendar className="w-8 h-8" />}
                        title="Today's Appointments"
                        value={stats.todayAppointments}
                        bgGradient="from-blue-500 to-blue-600"
                        iconBg="bg-blue-100"
                        iconColor="text-blue-600"
                    />
                    <StatsCard
                        icon={<CheckCircle2 className="w-8 h-8" />}
                        title="Completed Today"
                        value={stats.completedToday}
                        bgGradient="from-green-500 to-green-600"
                        iconBg="bg-green-100"
                        iconColor="text-green-600"
                    />
                    <StatsCard
                        icon={<Users className="w-8 h-8" />}
                        title="Total Patients"
                        value={stats.totalPatients}
                        bgGradient="from-purple-500 to-purple-600"
                        iconBg="bg-purple-100"
                        iconColor="text-purple-600"
                    />
                    <StatsCard
                        icon={<Clock className="w-8 h-8" />}
                        title="Avg. Consult Time"
                        value={`${stats.avgConsultTime}m`}
                        bgGradient="from-orange-500 to-orange-600"
                        iconBg="bg-orange-100"
                        iconColor="text-orange-600"
                    />
                </div>

                {/* Appointments & Queue Section */}
                <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden animate-fadeIn">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-5 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Patient Management</h2>
                                    <p className="text-sm text-gray-600">Manage appointments and walk-in queue</p>
                                </div>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex bg-white/50 p-1 rounded-xl border border-gray-200">
                                <button
                                    onClick={() => setActiveTab('appointments')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'appointments'
                                        ? 'bg-white shadow-sm text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    List View
                                </button>
                                <button
                                    onClick={() => setActiveTab('calendar')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'calendar'
                                        ? 'bg-white shadow-sm text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Calendar View
                                </button>
                                <button
                                    onClick={() => setActiveTab('queue')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'queue'
                                        ? 'bg-white shadow-sm text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Live Queue
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {activeTab === 'appointments' && <DoctorAppointments />}
                        {activeTab === 'calendar' && <DoctorCalendar />}
                        {activeTab === 'queue' && <DoctorQueue />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stats Card Component
interface StatsCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    bgGradient: string;
    iconBg: string;
    iconColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, bgGradient, iconBg, iconColor }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all transform hover:scale-105 animate-slideUp">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`${iconBg} ${iconColor} p-3 rounded-xl`}>
                {icon}
            </div>
        </div>
        <div className={`mt-4 h-1.5 bg-gradient-to-r ${bgGradient} rounded-full`}></div>
    </div>
);
