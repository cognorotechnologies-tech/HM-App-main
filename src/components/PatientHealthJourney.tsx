import { useEffect, useState } from 'react';
import { X, Calendar, Pill, FileText, Activity, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from './Button';
import { patientService } from '../services/patientService';
import { prescriptionService } from '../services/prescriptionService';
import { appointmentService } from '../services/appointmentService';

interface PatientHealthJourneyProps {
    patientId: string;
    patientName: string;
    onClose: () => void;
}

export default function PatientHealthJourney({ patientId, patientName, onClose }: PatientHealthJourneyProps) {
    const [patient, setPatient] = useState<any>(null);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'timeline' | 'prescriptions' | 'vitals'>('timeline');

    useEffect(() => {
        fetchPatientData();
    }, [patientId]);

    const fetchPatientData = async () => {
        try {
            // Fetch patient details
            const patientData = await patientService.getById(patientId);
            if (patientData) setPatient(patientData);

            // Fetch prescriptions
            const prescriptionsData = await prescriptionService.getByPatient(patientId);
            if (prescriptionsData) setPrescriptions(prescriptionsData);

            // Fetch appointments
            const appointmentsData = await appointmentService.getByPatient(patientId);
            if (appointmentsData) setAppointments(appointmentsData.slice(0, 20)); // Limit client side if needed

        } catch (error) {
            console.error('Error fetching patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Combine timeline events
    const getTimelineEvents = () => {
        const events: any[] = [];

        prescriptions.forEach(rx => {
            events.push({
                type: 'prescription',
                date: rx.created_at,
                icon: Pill,
                color: 'bg-green-100 text-green-700 border-green-200',
                title: `Prescription Issued`,
                doctor: `Dr. ${rx.doctor_last_name}`,
                details: rx.diagnosis,
                data: rx
            });
        });

        appointments.forEach(apt => {
            events.push({
                type: 'appointment',
                date: apt.appointment_date,
                icon: Calendar,
                color: apt.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200',
                title: `${apt.status === 'completed' ? 'Consultation' : 'Appointment'} - ${apt.doctor_specialization || 'General'}`,
                doctor: `Dr. ${apt.doctor_last_name}`,
                details: apt.reason || 'General consultation',
                data: apt
            });
        });

        return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const timelineEvents = getTimelineEvents();

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading health journey...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Activity className="text-blue-600" size={32} />
                            Patient Health Journey
                        </h2>
                        <p className="text-gray-700 mt-1 font-medium">{patientName}</p>
                        <p className="text-sm text-gray-500">Patient ID: #{patientId.slice(0, 8)}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-white/50 p-2 rounded-full transition-colors"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Health Summary Cards */}
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Total Visits</span>
                                <Calendar className="text-blue-500" size={20} />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{appointments.filter(a => a.status === 'completed').length}</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Prescriptions</span>
                                <Pill className="text-green-500" size={20} />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{prescriptions.length}</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Blood Group</span>
                                <Activity className="text-red-500" size={20} />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{patient?.blood_group || 'N/A'}</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">Age</span>
                                <TrendingUp className="text-purple-500" size={20} />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {patient?.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Critical Health Alerts */}
                    {(patient?.allergies?.length > 0 || patient?.chronic_conditions?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {patient.allergies?.length > 0 && (
                                <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                                    <h4 className="flex items-center text-red-800 font-bold mb-2">
                                        <AlertCircle size={18} className="mr-2" /> Allergies
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {patient.allergies.map((allergy: string, idx: number) => (
                                            <span key={idx} className="bg-white text-red-700 px-3 py-1 rounded-full border border-red-300 text-sm font-medium">
                                                {allergy}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {patient.chronic_conditions?.length > 0 && (
                                <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                                    <h4 className="flex items-center text-orange-800 font-bold mb-2">
                                        <Activity size={18} className="mr-2" /> Chronic Conditions
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {patient.chronic_conditions.map((condition: string, idx: number) => (
                                            <span key={idx} className="bg-white text-orange-700 px-3 py-1 rounded-full border border-orange-300 text-sm font-medium">
                                                {condition}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="px-8 pt-4 border-b border-gray-200 bg-white">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'timeline'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Clock size={16} className="inline mr-2" />
                            Timeline
                        </button>
                        <button
                            onClick={() => setActiveTab('prescriptions')}
                            className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'prescriptions'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Pill size={16} className="inline mr-2" />
                            Prescriptions ({prescriptions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('vitals')}
                            className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'vitals'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FileText size={16} className="inline mr-2" />
                            Medical Records
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            {timelineEvents.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No medical history yet</p>
                                    <p className="text-sm">Events will appear here as the patient receives care.</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-gray-200 to-transparent"></div>

                                    {timelineEvents.map((event, idx) => {
                                        const Icon = event.icon;
                                        return (
                                            <div key={idx} className="relative pl-20 pb-8">
                                                {/* Icon */}
                                                <div className={`absolute left-0 w-16 h-16 rounded-full flex items-center justify-center border-4 border-white ${event.color}`}>
                                                    <Icon size={24} />
                                                </div>

                                                {/* Content */}
                                                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-gray-900 text-lg">{event.title}</h4>
                                                        <span className="text-sm text-gray-500 font-medium">
                                                            {format(parseISO(event.date), 'MMM d, yyyy')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-blue-600 font-medium mb-2">{event.doctor}</p>
                                                    <p className="text-gray-700 text-sm mb-3">{event.details}</p>

                                                    {event.type === 'prescription' && event.data.medicines?.length > 0 && (
                                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Medicines</p>
                                                            <div className="space-y-1">
                                                                {event.data.medicines.slice(0, 3).map((med: any, i: number) => (
                                                                    <p key={i} className="text-sm text-gray-700">
                                                                        <span className="font-semibold">{med.medicine_name}</span> - {med.dosage} ({med.frequency})
                                                                    </p>
                                                                ))}
                                                                {event.data.medicines.length > 3 && (
                                                                    <p className="text-xs text-blue-600 font-medium">+{event.data.medicines.length - 3} more</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'prescriptions' && (
                        <div className="space-y-4">
                            {prescriptions.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Pill size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No prescriptions on record</p>
                                </div>
                            ) : (
                                prescriptions.map((rx) => (
                                    <div key={rx.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{rx.diagnosis || 'Prescription'}</h4>
                                                <p className="text-sm text-blue-600">Dr. {rx.doctor_first_name} {rx.doctor_last_name}</p>
                                            </div>
                                            <span className="text-sm text-gray-500">{format(parseISO(rx.created_at), 'MMM d, yyyy')}</span>
                                        </div>

                                        {rx.medicines?.length > 0 && (
                                            <table className="w-full text-sm">
                                                <thead className="border-b border-gray-200">
                                                    <tr className="text-left text-xs text-gray-500 uppercase">
                                                        <th className="pb-2">Medicine</th>
                                                        <th className="pb-2">Dosage</th>
                                                        <th className="pb-2">Frequency</th>
                                                        <th className="pb-2">Duration</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {rx.medicines.map((med: any, i: number) => (
                                                        <tr key={i}>
                                                            <td className="py-2 font-semibold text-gray-900">{med.medicine_name}</td>
                                                            <td className="py-2 text-gray-600">{med.dosage}</td>
                                                            <td className="py-2 text-gray-600 font-mono text-xs">{med.frequency}</td>
                                                            <td className="py-2 text-gray-600">{med.duration}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}

                                        {rx.instructions && (
                                            <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <p className="text-xs font-bold text-blue-700 uppercase mb-1">Instructions</p>
                                                <p className="text-sm text-gray-700">{rx.instructions}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'vitals' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-6">
                                <h4 className="font-bold text-gray-900 mb-4">Medical History Notes</h4>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[100px] whitespace-pre-wrap text-gray-700">
                                    {patient?.medical_history || 'No medical history notes recorded.'}
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-6">
                                <h4 className="font-bold text-gray-900 mb-4">Current Medications</h4>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-700">
                                    {patient?.current_medications || 'No current medications recorded.'}
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                                <FileText className="mx-auto text-blue-400 mb-3" size={48} />
                                <p className="text-blue-800 font-medium">Vitals Tracking Coming Soon</p>
                                <p className="text-sm text-blue-600">Monitor BP, weight, glucose levels over time</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}
