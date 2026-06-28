import { useEffect, useState } from 'react';
import { scheduleService, type Schedule } from '../../services/scheduleService';
import { doctorService } from '../../services/doctorService';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { Clock, Copy, Trash2, Plus, Calendar, CheckCircle } from 'lucide-react';



const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_COLORS = {
    Monday: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    Tuesday: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    Wednesday: { bg: 'from-green-500 to-green-600', light: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    Thursday: { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    Friday: { bg: 'from-pink-500 to-pink-600', light: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
    Saturday: { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
    Sunday: { bg: 'from-red-500 to-red-600', light: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
};

export default function ScheduleManager() {
    const toast = useToast();
    const { user } = useAuthStore();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [doctorId, setDoctorId] = useState<string | null>(null);
    const [editingDay, setEditingDay] = useState<string | null>(null);
    const [newSchedule, setNewSchedule] = useState({
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: 30
    });

    useEffect(() => {
        const fetchDoctorId = async () => {
            if (!user) return;
            try {
                // User ID is doctor ID
                // Verify doctor exists first
                const doctor = await doctorService.getById(user.id);
                if (doctor) {
                    setDoctorId(doctor.id);
                    fetchSchedules(doctor.id);
                }
            } catch (error) {
                console.error('Error fetching doctor:', error);
                toast.error('Session invalid. Please logout and login again.');
            }
        };
        fetchDoctorId();
    }, [user]);

    const fetchSchedules = async (docId: string) => {
        setIsLoading(true);
        try {
            const data = await scheduleService.getByDoctor(docId);
            setSchedules(data || []);
        } catch (error) {
            console.error('Error fetching schedules:', error);
            toast.error('Failed to load schedules');
        } finally {
            setIsLoading(false);
        }
    };

    const addSchedule = async (day: string) => {
        if (!doctorId) return;
        const dayNumber = day === 'Sunday' ? 0 : DAYS.indexOf(day) + 1;

        try {
            await scheduleService.create({
                doctor_id: doctorId,
                day_of_week: dayNumber,
                start_time: newSchedule.start_time,
                end_time: newSchedule.end_time,
                slot_duration: newSchedule.slot_duration
            });

            toast.success('Schedule added successfully! 🎉');
            fetchSchedules(doctorId);
            setEditingDay(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to add schedule');
        }
    };

    const deleteSchedule = async (id: string) => {
        try {
            await scheduleService.delete(id);
            toast.success('Schedule removed');
            if (doctorId) fetchSchedules(doctorId);
        } catch (error) {
            toast.error('Failed to remove');
        }
    };

    const copySchedule = async (schedule: Schedule, targetDay: string) => {
        if (!doctorId) return;
        const dayNumber = targetDay === 'Sunday' ? 0 : DAYS.indexOf(targetDay) + 1;

        try {
            await scheduleService.create({
                doctor_id: doctorId,
                day_of_week: dayNumber,
                start_time: schedule.start_time || '09:00',
                end_time: schedule.end_time,
                slot_duration: schedule.slot_duration || 30
            });

            toast.success('Copied');
            fetchSchedules(doctorId);
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    const getSchedulesForDay = (day: string) => {
        const dayNumber = day === 'Sunday' ? 0 : DAYS.indexOf(day) + 1;
        return schedules.filter(s => s.day_of_week === dayNumber);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 font-medium">Loading schedules...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 animate-fadeIn">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Schedule Management
                            </h1>
                            <p className="text-gray-600 mt-1">Set your weekly availability for appointments</p>
                        </div>
                    </div>
                </div>

                {/* Day Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {DAYS.map(day => {
                        const daySchedules = getSchedulesForDay(day);
                        const isEditing = editingDay === day;
                        const colors = DAY_COLORS[day as keyof typeof DAY_COLORS];

                        return (
                            <div key={day} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all animate-slideUp">
                                {/* Day Header */}
                                <div className={`bg-gradient-to-r ${colors.bg} px-6 py-4 flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="font-bold text-white text-lg">{day}</h3>
                                    </div>
                                    {daySchedules.length > 0 && (
                                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                            <span className="text-white text-sm font-semibold">{daySchedules.length} slot{daySchedules.length > 1 ? 's' : ''}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    {/* Add Button */}
                                    {!isEditing && (
                                        <button
                                            onClick={() => setEditingDay(day)}
                                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group font-medium"
                                        >
                                            <Plus size={18} className="group-hover:scale-110 transition-transform" />
                                            Add Time Slot
                                        </button>
                                    )}

                                    {/* Time Slots */}
                                    {daySchedules.length === 0 && !isEditing ? (
                                        <div className={`${colors.light} ${colors.border} border-2 border-dashed p-6 rounded-xl text-center`}>
                                            <Clock className={`w-12 h-12 ${colors.text} mx-auto mb-2 opacity-50`} />
                                            <p className={`${colors.text} font-medium`}>No availability set</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {daySchedules.map(schedule => (
                                                <div key={schedule.id} className={`${colors.light} ${colors.border} border-2 p-4 rounded-xl hover:shadow-md transition-all`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 bg-gradient-to-br ${colors.bg} rounded-xl flex items-center justify-center shadow`}>
                                                                <Clock className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-lg">
                                                                    {schedule.start_time?.slice(0, 5) || '09:00'} - {schedule.end_time.slice(0, 5)}
                                                                </p>
                                                                <p className={`text-sm ${colors.text} font-semibold`}>
                                                                    {schedule.slot_duration || 30} minute slots
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const targetDay = prompt(`Copy to which day?\n\n${DAYS.join(', ')}`);
                                                                    if (targetDay && DAYS.includes(targetDay)) {
                                                                        copySchedule(schedule, targetDay);
                                                                    }
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Copy to another day"
                                                            >
                                                                <Copy size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteSchedule(schedule.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Remove slot"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Form */}
                                    {isEditing && (
                                        <div className={`${colors.light} ${colors.border} border-2 p-5 rounded-xl animate-scaleIn`}>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={newSchedule.start_time}
                                                        onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={newSchedule.end_time}
                                                        onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Slot Duration</label>
                                                    <select
                                                        value={newSchedule.slot_duration}
                                                        onChange={(e) => setNewSchedule({ ...newSchedule, slot_duration: Number(e.target.value) })}
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                                                    >
                                                        <option value={15}>15 minutes</option>
                                                        <option value={30}>30 minutes</option>
                                                        <option value={45}>45 minutes</option>
                                                        <option value={60}>1 hour</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => setEditingDay(null)}
                                                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => addSchedule(day)}
                                                    className={`px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r ${colors.bg} rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                                                >
                                                    Save Slot
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
