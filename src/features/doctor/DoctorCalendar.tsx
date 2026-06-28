import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parseISO, isAfter, isBefore, addMinutes, startOfDay, endOfDay, setHours, setMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { scheduleService } from '../../services/scheduleService';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function DoctorCalendar() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user, currentDate]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch schedules (usually static weekly)
            const scheduleData = await scheduleService.getByDoctor(user.id);
            setSchedules(scheduleData || []);

            // Fetch appointments for the current week range
            // We'll just fetch all for now or optimize later to fetch by range if API supports it
            // For now fetching all doctor appointments and filtering client side for the view is okay for MVP unless huge data
            const appointmentData = await appointmentService.getByDoctor(user.id);
            setAppointments(appointmentData || []);

        } catch (error) {
            console.error('Error loading calendar data:', error);
        } finally {
            setLoading(false);
        }
    };

    const daysInWeek = eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 1 }), // Monday start
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
    });

    const timeSlots = [];
    for (let i = 8; i <= 20; i++) { // 8 AM to 8 PM
        timeSlots.push(i);
    }

    const getAppointmentsForSlot = (day: Date, hour: number) => {
        const slotStart = setMinutes(setHours(day, hour), 0);
        const slotEnd = setMinutes(setHours(day, hour + 1), 0);

        return appointments.filter(apt => {
            const aptDate = parseISO(apt.appointment_date);
            // Check if it's the same day
            if (!isSameDay(aptDate, day)) return false;

            const [aptHour, aptMinute] = apt.start_time.split(':').map(Number);
            const aptStart = setMinutes(setHours(day, aptHour), aptMinute);

            // Check if appointment starts within this hour slot
            return isAfter(aptStart, slotStart) && isBefore(aptStart, slotEnd) || (aptStart.getTime() === slotStart.getTime());
        });
    };

    const isSlotAvailable = (day: Date, hour: number) => {
        const dayOfWeek = day.getDay(); // 0-6 Sun-Sat
        // scheduleService uses 1-7 for Mon-Sun, 0 is Sunday? Check ScheduleManager.tsx
        // In ScheduleManager: const dayNumber = day === 'Sunday' ? 0 : DAYS.indexOf(day) + 1;
        // So 1=Mon, 2=Tue... 0=Sun.

        // Date.getDay(): 0=Sun, 1=Mon... Matches perfectly for Sunday(0).
        // But for Mon(1) it matches.

        const schedule = schedules.find(s => s.day_of_week === dayOfWeek);
        if (!schedule) return false;

        const startHour = parseInt(schedule.start_time.split(':')[0]);
        const endHour = parseInt(schedule.end_time.split(':')[0]);

        return hour >= startHour && hour < endHour;
    };

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
    const goToToday = () => setCurrentDate(new Date());

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-blue-100 border-blue-200 text-blue-700';
            case 'completed': return 'bg-green-100 border-green-200 text-green-700';
            case 'cancelled': return 'bg-red-100 border-red-200 text-red-700';
            default: return 'bg-yellow-100 border-yellow-200 text-yellow-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200 h-[600px]">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 font-medium">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
            {/* Calendar Header */}
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                            Week of {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        Today
                    </button>
                    <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto flex flex-col">
                {/* Days Header */}
                <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="p-4 border-r border-gray-100 bg-gray-50 text-xs font-bold text-gray-400 uppercase text-center flex items-center justify-center">
                        Time
                    </div>
                    {daysInWeek.map(day => {
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div key={day.toString()} className={`p-4 border-r border-gray-100 text-center ${isToday ? 'bg-blue-50/50' : ''}`}>
                                <p className={`text-xs font-bold uppercase mb-1 ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {format(day, 'EEE')}
                                </p>
                                <p className={`text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-900'
                                    }`}>
                                    {format(day, 'd')}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Time Slots */}
                <div className="flex-1">
                    {timeSlots.map(hour => (
                        <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-[100px]">
                            {/* Time Label */}
                            <div className="p-2 border-r border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 text-center relative">
                                <span className="-top-3 absolute left-0 right-0 mx-auto w-max bg-gray-50 px-1">
                                    {format(setHours(new Date(), hour), 'h a')}
                                </span>
                            </div>

                            {/* Days Columns */}
                            {daysInWeek.map(day => {
                                const available = isSlotAvailable(day, hour);
                                const cellAppointments = getAppointmentsForSlot(day, hour);
                                const isPast = isBefore(setHours(day, hour), new Date()) && !isSameDay(day, new Date());

                                return (
                                    <div
                                        key={`${day}-${hour}`}
                                        className={`border-r border-gray-100 p-1 relative group transition-colors 
                                            ${!available ? 'bg-gray-50/50 pattern-diagonal-lines opacity-60' : 'hover:bg-blue-50/10'}
                                            ${isPast ? 'opacity-70' : ''}
                                        `}
                                    >
                                        {!available && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                                <span className="text-[10px] font-medium text-gray-400 bg-white/80 px-2 py-1 rounded-full shadow-sm border border-gray-100">
                                                    Unavailable
                                                </span>
                                            </div>
                                        )}

                                        {cellAppointments.map(apt => (
                                            <div
                                                key={apt.id}
                                                onClick={() => navigate(`/dashboard/doctor/consultation/${apt.id}`)}
                                                className={`mb-1 p-2 rounded-lg border text-xs cursor-pointer shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02] ${getStatusColor(apt.status)}`}
                                            >
                                                <div className="flex items-center gap-1 font-bold mb-0.5 truncate">
                                                    <Clock size={10} className="flex-shrink-0" />
                                                    {apt.start_time.slice(0, 5)}
                                                </div>
                                                <div className="font-semibold truncate flex items-center gap-1">
                                                    <User size={10} className="flex-shrink-0" />
                                                    {apt.patient_first_name} {apt.patient_last_name}
                                                </div>
                                                {apt.reason && (
                                                    <div className="truncate opacity-80 mt-1 italic text-[10px]">
                                                        {apt.reason}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
