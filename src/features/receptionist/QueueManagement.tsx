import { useState, useEffect } from 'react';
import { Clock, XCircle, Play } from 'lucide-react';
import api from '../../lib/axios';
import { useToast } from '../../hooks/useToast';

interface PatientVisit {
    id: string;
    token_number: string;
    status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
    visit_type: string;
    created_at: string;
    patient: {
        first_name: string;
        last_name: string;
    };
    doctor: {
        specialization: string;
        profile: {
            first_name: string;
            last_name: string;
        };
    };
}

export default function QueueManagement() {
    const [visits, setVisits] = useState<PatientVisit[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchVisits();

        // Polling every 10 seconds instead of real-time subscription
        const interval = setInterval(fetchVisits, 10000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const fetchVisits = async () => {
        try {
            const { data } = await api.get('/receptionist/queue');
            setVisits(data || []);
        } catch (err) {
            console.error('Error fetching queue:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await api.put(`/receptionist/visits/${id}/status`, { status: newStatus });
            toast.success(`Visit status updated to ${newStatus}`);
            fetchVisits();
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div>Loading queue...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Live Queue Management</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visits.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No patients in waiting queue</p>
                    </div>
                ) : (
                    visits.map((visit) => (
                        <div key={visit.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">{visit.token_number}</h2>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mt-2">
                                        {visit.visit_type}
                                    </span>
                                </div>
                                <Clock className="h-6 w-6 text-gray-400" />
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-gray-600">
                                    Patient: <span className="font-medium">{visit.patient.first_name} {visit.patient.last_name}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Doctor: <span className="font-medium">Dr. {visit.doctor.profile.first_name} {visit.doctor.profile.last_name}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Waiting since: {new Date(visit.created_at).toLocaleTimeString()}
                                </p>
                            </div>

                            <div className="flex space-x-2 pt-4 border-t">
                                <button
                                    onClick={() => updateStatus(visit.id, 'cancelled')}
                                    className="flex-1 bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-2"
                                >
                                    <XCircle size={16} /> Cancel
                                </button>
                                <button
                                    onClick={() => updateStatus(visit.id, 'in_progress')}
                                    className="flex-1 bg-green-50 text-green-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-100 flex items-center justify-center gap-2"
                                >
                                    <Play size={16} /> Start
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
