import { useState, useEffect } from 'react';
import { Clock, Play, User, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { appointmentService } from '../../services/appointmentService';
import { useToast } from '../../hooks/useToast';

interface QueueItem {
    id: string; // visit id
    token_number: string;
    status: string;
    visit_type: string;
    created_at: string;
    patient: {
        id: string;
        first_name: string;
        last_name: string;
        gender: string;
        date_of_birth: string;
    };
    chief_complaint?: string;
}

export default function DoctorQueue() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const toast = useToast();
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const profile = (useAuthStore.getState() as any).profile;

    useEffect(() => {
        if (profile?.id) {
            fetchQueue();
            const interval = setInterval(fetchQueue, 15000); // 15s polling
            return () => clearInterval(interval);
        } else {
            // If no profile (not loaded yet or not a doctor), stop loading
            const timer = setTimeout(() => setLoading(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [profile?.id]);

    const fetchQueue = async () => {
        try {
            // Fetch queue filtered by this doctor's ID
            const { data } = await api.get('/receptionist/queue', {
                params: { doctor_id: profile?.id }
            });
            setQueue(data || []);
        } catch (error) {
            console.error('Failed to fetch queue', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartConsultation = async (visit: QueueItem) => {
        try {
            setProcessingId(visit.id);

            // 1. Create a Walk-in Appointment
            const appointment = await appointmentService.create({
                patient_id: visit.patient.id,
                doctor_id: profile.id,
                appointment_date: new Date().toISOString(),
                start_time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                end_time: new Date(Date.now() + 30 * 60000).toLocaleTimeString('en-US', { hour12: false }), // +30 mins
                appointment_type: 'Walk-in',
                status: 'in_progress',
                reason: visit.chief_complaint || 'Walk-in Consultation',
                notes: `Token: ${visit.token_number}`
            });

            // 2. Update Visit Status in Queue to 'in_progress' (or completed, but in_progress keeps it tracked until done)
            await api.put(`/receptionist/visits/${visit.id}/status`, { status: 'in_progress' });

            // 3. Navigate to Consultation
            toast.success('Consultation started');
            navigate(`/dashboard/doctor/consultation/${appointment.id}`);

        } catch (error) {
            console.error('Failed to start consultation:', error);
            toast.error('Failed to start consultation');
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading queue...</div>;

    if (queue.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No Patients Waiting</h3>
                <p className="text-gray-500">Your queue is currently empty.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {queue.map((visit) => (
                <div key={visit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Status Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${visit.status === 'in_progress' ? 'bg-green-500' : 'bg-blue-500'}`}></div>

                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded mb-1">
                                #{visit.token_number}
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg">
                                {visit.patient.first_name} {visit.patient.last_name}
                            </h3>
                            <p className="text-xs text-gray-500">{visit.patient.gender} • {calculateAge(visit.patient.date_of_birth)} yrs</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                <Clock size={12} />
                                {new Date(visit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    {visit.chief_complaint && (
                        <div className="mb-4 bg-gray-50 p-2 rounded text-sm text-gray-700">
                            <span className="font-semibold text-gray-900 text-xs uppercase block mb-0.5">Complaint</span>
                            {visit.chief_complaint}
                        </div>
                    )}

                    <button
                        onClick={() => handleStartConsultation(visit)}
                        disabled={!!processingId}
                        className="w-full mt-2 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {processingId === visit.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Play size={16} fill="currentColor" />
                        )}
                        Start Consultation
                    </button>
                </div>
            ))}
        </div>
    );
}

function calculateAge(dob: string) {
    if (!dob) return 'N/A';
    return new Date().getFullYear() - new Date(dob).getFullYear();
}
