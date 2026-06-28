// TypeScript strict checks enabled
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, FileText, Clock, User, ArrowLeft, Calendar, Timer, CheckCircle2, Beaker, Mic, Printer } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { healthMetricsService, type HealthMetric } from '../../services/healthMetricsService';
import { aiService } from '../../services/aiService';
import { VitalsChart } from '../emr/VitalsChart';
import { DocumentList } from '../emr/DocumentList';
import { PrescriptionEditor } from './PrescriptionEditor';
import { useToast } from '../../hooks/useToast';
import { AllergyAlertBanner } from '../../components/AllergyAlertBanner';
import { ConsultationTimer } from './ConsultationTimer';
import { LabTestOrderingModal } from '../../components/LabTestOrderingModal';
import { AppointmentActivityTimeline } from '../../components/AppointmentActivityTimeline';
import { LabReportUpload } from '../../components/LabReportUpload';
import { LabResultsList } from './LabResultsList';
import { labResultService } from '../../services/labResultService';
import { CarePlanSelector } from './CarePlanSelector';
import { FollowUpSchedulingModal } from '../../components/FollowUpSchedulingModal';
import { LiveTranscript } from './LiveTranscript';
import { transcriptService } from '../../services/transcriptService';

export const PatientConsultation = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'vitals' | 'documents' | 'history' | 'transcript'>('vitals');
    const [vitals, setVitals] = useState<HealthMetric[]>([]);
    const [consultationStartTime] = useState(new Date());
    const [prescribedMedicines, setPrescribedMedicines] = useState<string[]>([]); // For allergy checking
    const [showLabTestModal, setShowLabTestModal] = useState(false);
    const [showLabReportUpload, setShowLabReportUpload] = useState(false);
    const [docsRefreshTrigger, setDocsRefreshTrigger] = useState(0);

    // AI Summary State
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Workflow & Follow-up State
    const [showCarePlanModal, setShowCarePlanModal] = useState(false);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);

    useEffect(() => {
        if (appointment && vitals.length > 0 && !aiSummary) {
            generateSummary();
        }
    }, [appointment, vitals]);

    const generateSummary = async () => {
        try {
            setLoadingSummary(true);
            const summary = await aiService.generatePatientSummary(
                appointment.patient?.medical_history || {},
                vitals
            );
            setAiSummary(summary);
        } catch (error) {
            console.error('Failed to generate summary', error);
        } finally {
            setLoadingSummary(false);
        }
    };

    useEffect(() => {
        if (!appointmentId) return;
        fetchData();
    }, [appointmentId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const apptData = await appointmentService.getById(appointmentId!);
            setAppointment(apptData);

            if (apptData.patient_id) {
                const vitalsData = await healthMetricsService.getByPatient(apptData.patient_id);
                setVitals(vitalsData);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load consultation data');
        } finally {
            setLoading(false);
        }
    };


    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] bg-gray-50 items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 font-medium">Loading consultation...</p>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="flex h-[calc(100vh-64px)] bg-gray-50 items-center justify-center">
                <div className="text-center space-y-2">
                    <p className="text-gray-800 font-semibold text-lg">Appointment not found</p>
                    <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    // Adapt flat backend response to nested structure
    const patient = appointment.patient || {
        id: appointment.patient_id,
        gender: appointment.patient_gender,
        date_of_birth: appointment.patient_dob,
        medical_history: appointment.patient_medical_history
            ? appointment.patient_medical_history
            : {
                allergies: appointment.patient_allergies || [],
                chronic_conditions: appointment.patient_chronic_conditions || []
            }
    };

    // Ensure profile exists either from nested or flat structure
    const profile = patient.profile || {
        first_name: appointment.patient_first_name,
        last_name: appointment.patient_last_name,
        email: appointment.patient_email,
        phone: appointment.patient_phone
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden relative">
            {/* Sidebar Toggle (Mobile/Desktop) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute left-4 top-4 z-20 p-2 bg-white shadow-md rounded-lg text-gray-600 hover:text-blue-600 border border-gray-200 lg:hidden"
                    title="Open Patient Details"
                >
                    <User size={20} />
                </button>
            )}

            {/* Left Sidebar - Patient Record (Fixed width ~300px) */}
            <div
                className={`
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 lg:static fixed inset-y-0 left-0
                    w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-xl lg:shadow-none z-30 
                    transition-transform duration-300 ease-in-out
                `}
            >
                {/* Patient Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 relative flex-shrink-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 text-sm font-medium transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute right-4 top-4 p-1.5 bg-white/50 hover:bg-white rounded-full text-gray-500 lg:hidden"
                    >
                        <ArrowLeft size={16} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg relative mb-3">
                            {profile.first_name?.[0]}{profile.last_name?.[0]}
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                <CheckCircle2 size={12} className="text-white" />
                            </div>
                        </div>
                        <h2 className="font-bold text-gray-900 text-xl truncate w-full">
                            {profile.first_name} {profile.last_name}
                        </h2>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-white/80 border border-gray-100 rounded-lg text-xs font-semibold shadow-sm text-gray-600">
                                {calculateAge(patient?.date_of_birth)} yrs
                            </span>
                            <span className="px-2 py-0.5 bg-white/80 border border-gray-100 rounded-lg text-xs font-semibold shadow-sm text-gray-600 uppercase">
                                {patient?.gender || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* AI Patient Summary Card - Compact */}
                    <div className="mt-6 bg-white/80 backdrop-blur border border-indigo-100 p-3 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm">✨</span>
                                <h4 className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide">AI Insight</h4>
                            </div>
                        </div>
                        {loadingSummary ? (
                            <div className="h-8 bg-indigo-50 animate-pulse rounded"></div>
                        ) : (
                            <p className="text-xs text-indigo-800 leading-snug font-medium">
                                {aiSummary || 'Analysis unavailable'}
                            </p>
                        )}
                        <button
                            onClick={() => setShowCarePlanModal(true)}
                            className="mt-2 w-full text-[10px] bg-indigo-100 text-indigo-700 py-1 rounded font-medium hover:bg-indigo-200 transition-colors"
                        >
                            Enroll in Care Plan
                        </button>
                    </div>

                    {/* Appointment Info Compact */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="bg-white/60 p-2 rounded-lg text-center border border-gray-100">
                            <span className="block text-[10px] text-gray-500 uppercase">Date</span>
                            <p className="text-xs font-bold text-gray-800">{formatDate(appointment.appointment_date).split(',')[0]}</p>
                        </div>
                        <div className="bg-white/60 p-2 rounded-lg text-center border border-gray-100">
                            <span className="block text-[10px] text-gray-500 uppercase">Time</span>
                            <p className="text-xs font-bold text-gray-800">{formatTime(appointment.start_time)}</p>
                        </div>
                    </div>
                </div>

                {/* Left Sidebar Content - Allergies */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <AllergyAlertBanner
                        patientId={patient.id}
                        allergies={patient.allergies || []}
                        prescribedMedicines={prescribedMedicines}
                        compact
                    />
                </div>
            </div>

            {/* Center Main - Prescription Editor & Bottom Context Panel */}
            <div className="flex-1 h-full overflow-y-auto bg-gray-50 relative z-0 custom-scrollbar">
                {/* Top: Editor Content */}
                <div className="p-4 md:p-6 pb-8 max-w-4xl mx-auto space-y-6">
                    {/* Header Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Consultation</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <ConsultationTimer
                                appointmentId={appointment.id}
                                onTimerStart={() => console.log('Consultation timer started')}
                            />
                            <button
                                onClick={() => setShowFollowUpModal(true)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 border border-blue-100"
                            >
                                Follow-up
                            </button>
                        </div>
                    </div>

                    {/* Prescription Editor */}
                    <PrescriptionEditor
                        appointmentId={appointment.id}
                        patientId={patient.id}
                        patient={patient}
                        onMedicinesChange={(medicines) => setPrescribedMedicines(medicines)}
                        onSaveSuccess={() => {
                            toast.success('Prescription saved successfully! 🎉');
                            setTimeout(() => navigate('/dashboard/doctor'), 1500);
                        }}
                    />
                </div>

                {/* Bottom: Context Tabs (Vitals, History, etc) - Auto Height */}
                <div className="w-full bg-white border-t border-gray-200 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
                        <TabButton
                            active={activeTab === 'vitals'}
                            onClick={() => setActiveTab('vitals')}
                            icon={<Activity size={16} />}
                            label="Vitals"
                            color="blue"
                        />
                        <TabButton
                            active={activeTab === 'documents'}
                            onClick={() => setActiveTab('documents')}
                            icon={<FileText size={16} />}
                            label="Docs"
                            color="green"
                        />
                        <TabButton
                            active={activeTab === 'transcript'}
                            onClick={() => setActiveTab('transcript')}
                            icon={<Mic size={16} />}
                            label="Live"
                            color="red"
                        />
                        <TabButton
                            active={activeTab === 'history'}
                            onClick={() => setActiveTab('history')}
                            icon={<Clock size={16} />}
                            label="History"
                            color="purple"
                        />
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 bg-white">
                        <div className="animate-fadeIn">
                            {activeTab === 'vitals' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <VitalCard
                                        title="Blood Pressure"
                                        trend={calculateTrend(vitals, 'blood_pressure')}
                                    >
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {(() => {
                                                    const val = vitals.find(v => v.metric_type === 'blood_pressure')?.value;
                                                    if (!val) return '--/--';
                                                    if (typeof val === 'object' && val.systolic && val.diastolic) {
                                                        return `${val.systolic}/${val.diastolic}`;
                                                    }
                                                    return val;
                                                })()}
                                            </span>
                                            <span className="text-xs text-gray-500 mb-1">mmHg</span>
                                        </div>
                                        <div className="w-full h-80">
                                            <VitalsChart data={vitals.filter(v => v.metric_type === 'blood_pressure')} type="blood_pressure" />
                                        </div>
                                    </VitalCard>
                                    <VitalCard
                                        title="Weight Trend"
                                        trend={calculateTrend(vitals, 'weight')}
                                    >
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-2xl font-bold text-gray-900">
                                                {(() => {
                                                    const val = vitals.find(v => v.metric_type === 'weight')?.value;
                                                    return (typeof val === 'object' ? val.value : val) || '--';
                                                })()}
                                            </span>
                                            <span className="text-xs text-gray-500 mb-1">kg</span>
                                        </div>
                                        <div className="w-full h-80">
                                            <VitalsChart data={vitals.filter(v => v.metric_type === 'weight')} type="weight" />
                                        </div>
                                    </VitalCard>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => window.open(`/prescription/print/${appointment.id}`, '_blank')}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                                        >
                                            <Printer size={16} />
                                            Print Rx
                                        </button>
                                        <button
                                            onClick={() => setShowLabReportUpload(true)}
                                            className="px-6 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <FileText size={16} />
                                            AI Analyze
                                        </button>
                                    </div>
                                    <hr className="border-gray-100" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <LabResultsList patientId={patient.id} refreshTrigger={docsRefreshTrigger} />
                                        <DocumentList patientId={patient.id} refreshTrigger={docsRefreshTrigger} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
                                        <h4 className="font-bold text-xs uppercase text-gray-500 mb-4 block">Conditions</h4>
                                        {patient.medical_history?.chronic_conditions?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {patient.medical_history.chronic_conditions.map((condition: string, i: number) => (
                                                    <span key={i} className="px-3 py-1.5 bg-white text-gray-700 rounded-md shadow-sm text-sm border border-gray-100">
                                                        {condition}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">None recorded</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <AppointmentActivityTimeline appointmentId={appointment.id} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'transcript' && (
                                <div className="min-h-[300px]">
                                    <LiveTranscript
                                        appointmentId={appointment.id}
                                        onSaveTranscript={async (transcript) => {
                                            try {
                                                await transcriptService.save({
                                                    appointment_id: appointment.id,
                                                    doctor_id: appointment.doctor_id,
                                                    patient_id: appointment.patient_id,
                                                    transcript_text: transcript,
                                                    metadata: { duration: Date.now() - consultationStartTime.getTime() }
                                                });
                                                toast.success('Transcript saved successfully');
                                            } catch (error) {
                                                console.error('Failed to save transcript:', error);
                                                toast.error('Failed to save transcript');
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lab Test Ordering Modal */}
            {appointment && (
                <LabTestOrderingModal
                    isOpen={showLabTestModal}
                    onClose={() => setShowLabTestModal(false)}
                    patientId={appointment.patient_id}
                    doctorId={appointment.doctor_id}
                    appointmentId={appointment.id}
                    onOrderPlaced={(orderId) => {
                        toast.success(`Lab test order #${orderId} placed successfully!`);
                        // Optionally refresh data or show confirmation
                    }}
                />
            )}

            {/* Smart Lab Report Upload Modal */}
            <LabReportUpload
                isOpen={showLabReportUpload}
                onClose={() => setShowLabReportUpload(false)}
                onAnalysisComplete={async (data) => {
                    try {
                        const result = await labResultService.create({
                            patient_id: patient.id,
                            doctor_id: appointment.doctor_id,
                            test_type: 'Lab Report Analysis',
                            test_date: new Date().toISOString(),
                            status: 'reviewed',
                            raw_data: data,
                            summary: 'AI Analyzed Report',
                            // For now we don't have file upload to storage bucket, so file_url is empty
                            file_url: ''
                        });
                        toast.success('Lab report saved successfully');
                        setDocsRefreshTrigger(prev => prev + 1);
                        setShowLabReportUpload(false);
                    } catch (error) {
                        console.error('Failed to save lab result', error);
                        toast.error('Failed to save lab result');
                    }
                }}
            />

            {/* Care Plan Enrollment Modal */}
            {showCarePlanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scaleIn">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Enroll in Care Plan</h3>
                            <button
                                onClick={() => setShowCarePlanModal(false)}
                                className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                            >
                                <ArrowLeft size={18} className="rotate-180" />
                            </button>
                        </div>
                        <div className="p-4">
                            <CarePlanSelector
                                patientId={patient.id}
                                onEnroll={() => {
                                    // Optional: Refresh workflows list or show success state
                                    // setShowCarePlanModal(false); // Keep open to see status? or close?
                                    // Let's keep it open briefly or let user close
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Follow-up Modal */}
            {appointment && (
                <FollowUpSchedulingModal
                    isOpen={showFollowUpModal}
                    onClose={() => setShowFollowUpModal(false)}
                    patientId={appointment.patient_id}
                    doctorId={appointment.doctor_id}
                    appointmentId={appointment.id}
                    onScheduled={() => {
                        // Could update local state to show "Follow-up Scheduled" badge
                    }}
                />
            )}
        </div>
    );
};

// Helper Components
const TabButton = ({ active, onClick, icon, label, color }: any) => {
    const colorClasses = {
        blue: active ? 'border-blue-500 text-blue-600 bg-blue-50' : '',
        green: active ? 'border-green-500 text-green-600 bg-green-50' : '',
        purple: active ? 'border-purple-500 text-purple-600 bg-purple-50' : '',
    };

    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-all duration-200 ${active
                ? colorClasses[color as keyof typeof colorClasses]
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
        >
            {icon}
            {label}
        </button>
    );
};

const VitalCard = ({ title, children, trend }: { title: string; children: React.ReactNode; trend?: { trend: 'up' | 'down' | 'neutral', value: string } | null }) => (
    <div className="bg-gradient-to-br from-white to-blue-50/30 p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                {title}
            </h3>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${trend.trend === 'up' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                    {trend.trend === 'up' ? '↗' : '↘'} {trend.value}
                </div>
            )}
        </div>
        {children}
    </div>
);

// Helpers
function formatDate(dateStr: string) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Helper to calculate trend from vitals history
function calculateTrend(vitals: HealthMetric[], type: string): { trend: 'up' | 'down' | 'neutral', value: string, diff: string } | null {
    // Filter vitals by type and sort by date descending
    const typeVitals = vitals
        .filter(v => v.metric_type === type)
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

    if (typeVitals.length < 2) return null;

    const getVal = (v: any) => {
        if (typeof v === 'object') return v.systolic || v.value;
        return v;
    };

    const current = parseFloat(getVal(typeVitals[0].value));
    const previous = parseFloat(getVal(typeVitals[1].value));

    if (isNaN(current) || isNaN(previous)) return null;

    const diff = current - previous;
    const percentChange = ((diff / previous) * 100).toFixed(1);

    // For BP we might need special handling if value is "120/80", but assuming simple number for weight/etc for now
    // If BP is string "120/80", parseFloat will only take 120 (Systolic), which is a fair proxy for trend

    if (Math.abs(diff) < 0.1) return { trend: 'neutral', value: '0%', diff: '0' };

    return {
        trend: diff > 0 ? 'up' : 'down',
        value: `${Math.abs(Number(percentChange))}%`,
        diff: `${Math.abs(diff).toFixed(1)} unit`
    };
}

function calculateAge(dob: string) {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function calculateBMI(weight?: number, height?: number) {
    if (!weight || !height) return null;
    // Height in cm to meters
    const heightInM = height / 100;
    return (weight / (heightInM * heightInM)).toFixed(1);
}

function formatTime(timeStr: string) {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
}
