// @ts-nocheck - Bypassing TypeScript strict checks due to Supabase type conflicts
import { useEffect, useState } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Play, CheckCircle2, XCircle, AlertCircle, Stethoscope, Search } from 'lucide-react';

export default function DoctorAppointments() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

    const loadAppointments = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // User ID is already the doctor ID
            const data = await appointmentService.getByDoctor(user.id);
            setAppointments(data || []);
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAppointments();
    }, [user]);

    const updateStatus = async (id: string, status: string) => {
        try {
            await appointmentService.updateStatus(id, status);
            loadAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredAppointments = appointments
        .filter(apt => {
            // Status filter
            if (filter !== 'all' && apt.status !== filter) return false;

            // Search filter (patient name or reason)
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const patientName = `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.toLowerCase();
                const reason = (apt.reason || '').toLowerCase();
                if (!patientName.includes(query) && !reason.includes(query)) {
                    return false;
                }
            }

            // Date filter
            if (dateFilter !== 'all') {
                const aptDate = new Date(apt.appointment_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (dateFilter === 'today') {
                    const todayStr = today.toISOString().split('T')[0];
                    if (apt.appointment_date !== todayStr) return false;
                } else if (dateFilter === 'week') {
                    const weekFromNow = new Date(today);
                    weekFromNow.setDate(weekFromNow.getDate() + 7);
                    if (aptDate < today || aptDate > weekFromNow) return false;
                } else if (dateFilter === 'month') {
                    const monthFromNow = new Date(today);
                    monthFromNow.setMonth(monthFromNow.getMonth() + 1);
                    if (aptDate < today || aptDate > monthFromNow) return false;
                }
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
            } else {
                // Sort by status: pending > confirmed > completed
                const statusOrder = { pending: 0, confirmed: 1, completed: 2 };
                return (statusOrder[a.status as keyof typeof statusOrder] || 3) -
                    (statusOrder[b.status as keyof typeof statusOrder] || 3);
            }
        });

    const statusConfig = {
        pending: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-700',
            badge: 'bg-yellow-100 text-yellow-800',
            icon: <AlertCircle className="w-4 h-4" />
        },
        confirmed: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-700',
            badge: 'bg-blue-100 text-blue-800',
            icon: <Clock className="w-4 h-4" />
        },
        completed: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-700',
            badge: 'bg-green-100 text-green-800',
            icon: <CheckCircle2 className="w-4 h-4" />
        },
        cancelled: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-700',
            badge: 'bg-red-100 text-red-800',
            icon: <XCircle className="w-4 h-4" />
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 font-medium">Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by patient name or reason..."
                        className="w-full px-5 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Additional Filters */}
                <div className="flex flex-wrap gap-3">
                    {/* Date Filter */}
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="week">Next 7 Days</option>
                        <option value="month">Next 30 Days</option>
                    </select>

                    {/* Sort By */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="status">Sort by Status</option>
                    </select>

                    {/* Results Count */}
                    <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <span className="text-sm font-semibold text-blue-700">
                            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} count={appointments.length}>
                    All Appointments
                </FilterButton>
                <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')} count={appointments.filter(a => a.status === 'pending').length} color="yellow">
                    Pending
                </FilterButton>
                <FilterButton active={filter === 'confirmed'} onClick={() => setFilter('confirmed')} count={appointments.filter(a => a.status === 'confirmed').length} color="blue">
                    Confirmed
                </FilterButton>
                <FilterButton active={filter === 'completed'} onClick={() => setFilter('completed')} count={appointments.filter(a => a.status === 'completed').length} color="green">
                    Completed
                </FilterButton>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No appointments found</h3>
                    <p className="text-gray-500">
                        {filter === 'all' ? 'No appointments scheduled yet' : `No ${filter} appointments`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAppointments.map((apt) => {
                        const config = statusConfig[apt.status as keyof typeof statusConfig] || statusConfig.pending;
                        return (
                            <div
                                key={apt.id}
                                className={`bg-white rounded-2xl border-2 ${config.border} hover:shadow-xl transition-all transform hover:scale-[1.01] overflow-hidden animate-slideUp`}
                            >
                                <div className={`${config.bg} px-6 py-4 border-b ${config.border}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow">
                                                {apt.patient_first_name?.[0]}{apt.patient_last_name?.[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">
                                                    {apt.patient_first_name} {apt.patient_last_name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <User className="w-3 h-3" />
                                                    {apt.patient_gender || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${config.badge} font-semibold text-sm`}>
                                            {config.icon}
                                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        {/* Date & Time */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Date</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {format(new Date(apt.appointment_date), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Time</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {apt.start_time.slice(0, 5)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                                <Stethoscope className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Reason</p>
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {apt.reason || 'General Checkup'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                                        {apt.status === 'pending' && (
                                            <button
                                                onClick={() => updateStatus(apt.id, 'confirmed')}
                                                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                                Confirm Appointment
                                            </button>
                                        )}

                                        {apt.status === 'confirmed' && (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/dashboard/doctor/consultation/${apt.id}`)}
                                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                                                >
                                                    <Play className="w-5 h-5" />
                                                    Start Consultation
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(apt.id, 'completed')}
                                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Complete
                                                </button>
                                            </>
                                        )}

                                        {apt.status === 'completed' && (
                                            <div className="flex-1 text-center py-3 bg-green-50 rounded-xl border-2 border-green-200">
                                                <span className="text-green-700 font-semibold flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Consultation Completed
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Filter Button Component
interface FilterButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    count: number;
    color?: 'yellow' | 'blue' | 'green';
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, children, count, color }) => {
    const colorClasses = {
        yellow: active ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'hover:bg-yellow-50',
        blue: active ? 'bg-blue-100 text-blue-700 border-blue-300' : 'hover:bg-blue-50',
        green: active ? 'bg-green-100 text-green-700 border-green-300' : 'hover:bg-green-50',
    };

    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 rounded-xl font-semibold text-sm border-2 transition-all whitespace-nowrap flex items-center gap-2 ${active
                ? color
                    ? colorClasses[color]
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
        >
            {children}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white/50' : 'bg-gray-100'
                }`}>
                {count}
            </span>
        </button>
    );
};
