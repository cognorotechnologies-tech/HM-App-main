
// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { receptionistService } from '../../services/receptionistService';
import { departmentService } from '../../services/departmentService';
import { ArrowLeft, User, Phone, Mail, Activity, Calendar, FileText, CheckCircle, AlertCircle, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import api from '../../lib/axios';
import { useToast } from '../../hooks/useToast';
import { healthMetricsService } from '../../services/healthMetricsService';

// --- Types & Schemas ---

// Update schema
const editPatientSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone is required'),
    dateOfBirth: z.string().min(1, 'DOB is required'),
    gender: z.enum(['male', 'female', 'other']),
    bloodGroup: z.string().optional(),
    // Optional Vitals
    // Optional Vitals
    systolic: z.string().optional(),
    diastolic: z.string().optional(),
    pulse: z.string().optional(),
    temperature: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
});



const checkInSchema = z.object({
    departmentId: z.string().min(1, 'Select a department'),
    doctorId: z.string().min(1, 'Select a doctor'),
    visitType: z.enum(['opd', 'emergency', 'followup']),
    chiefComplaint: z.string().min(3, 'Required'),
    // Vitals - Now Mandatory
    bp: z.string().min(1, 'BP is required'),
    pulse: z.string().min(1, 'Pulse is required'),
    temperature: z.string().min(1, 'Temp is required'),
    weight: z.string().min(1, 'Weight is required'),
    height: z.string().min(1, 'Height is required'),
});

// --- Components ---

export default function PatientDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    // Data State
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);

    useEffect(() => {
        if (id) fetchPatient();
    }, [id]);

    const fetchPatient = async () => {
        setLoading(true);
        try {
            const data = await patientService.getById(id!);
            setPatient(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch patient details");
        } finally {
            setLoading(false);
        }
    };

    const handlePatientUpdate = async (data: any) => {
        try {
            await patientService.update(patient.id, {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                phone: data.phone,
                date_of_birth: data.dateOfBirth,
                gender: data.gender,
                blood_group: data.bloodGroup
            });

            // Save Vitals if provided
            let bpValue = '';
            if (data.systolic && data.diastolic) {
                bpValue = `${data.systolic}/${data.diastolic}`;
            }

            const vitalsToSave = [
                { type: 'blood_pressure', value: bpValue, unit: 'mmHg' },
                { type: 'heart_rate', value: data.pulse, unit: 'bpm' },
                { type: 'temperature', value: data.temperature, unit: 'F' },
                { type: 'weight', value: data.weight, unit: 'kg' },
                { type: 'height', value: data.height, unit: 'cm' }
            ];

            for (const vital of vitalsToSave) {
                if (vital.value) {
                    await healthMetricsService.create({
                        patient_id: patient.id,
                        metric_type: vital.type,
                        value: vital.value,
                        unit: vital.unit,
                        recorded_at: new Date().toISOString()
                    });
                }
            }

            toast.success("Patient details & vitals updated");
            setIsEditOpen(false);
            fetchPatient();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update patient");
        }
    };

    const handleCheckIn = async (data: any) => {
        try {
            await receptionistService.createVisit({
                patientId: patient.id,
                departmentId: data.departmentId,
                doctorId: data.doctorId,
                visitType: data.visitType,
                chiefComplaint: data.chiefComplaint,
                vitals: {
                    bp: data.bp,
                    pulse: data.pulse,
                    temperature: data.temperature,
                    weight: data.weight,
                    height: data.height
                },
                createdBy: 'receptionist' // Backend overrides this with user ID
            });
            toast.success("Patient added to queue successfully!");
            setIsCheckInOpen(false);
            navigate('/dashboard/receptionist/queue');
        } catch (error) {
            console.error(error);
            toast.error("Failed to check in patient");
        }
    };

    const checkMandatoryFields = () => {
        if (!patient) return false;
        // Example mandatory fields
        const missing = [];
        if (!patient.profiles?.first_name) missing.push('First Name');
        if (!patient.profiles?.last_name) missing.push('Last Name');
        if (!patient.profiles?.phone) missing.push('Phone');
        if (!patient.date_of_birth) missing.push('Date of Birth');
        if (!patient.gender) missing.push('Gender');

        if (missing.length > 0) {
            toast.error(`Please update missing details: ${missing.join(', ')}`);
            setIsEditOpen(true);
            return false;
        }
        return true;
    };

    const openCheckIn = () => {
        if (checkMandatoryFields()) {
            setIsCheckInOpen(true);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!patient) return <div className="p-8 text-center text-red-500">Patient not found</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                    <Button onClick={openCheckIn}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Add to Queue
                    </Button>
                </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <User className="w-64 h-64" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-24 h-24 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-3xl font-bold">
                        {patient.profiles?.first_name?.[0]}{patient.profiles?.last_name?.[0]}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {patient.profiles?.first_name} {patient.profiles?.last_name}
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-gray-600">
                            <div className="flex items-center gap-1"><Mail className="w-4 h-4" /> {patient.profiles?.email}</div>
                            <div className="flex items-center gap-1"><Phone className="w-4 h-4" /> {patient.profiles?.phone || 'N/A'}</div>
                            <div className="flex items-center gap-1 capitalize"><User className="w-4 h-4" /> {patient.gender} • {calculateAge(patient.date_of_birth)} yrs</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <InfoCard title="Personal Information" icon={User}>
                    <InfoRow label="DOB" value={patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'} />
                    <InfoRow label="Blood Group" value={patient.blood_group || 'N/A'} />
                    <InfoRow label="Address" value={parsedAddress(patient.address_street, patient.address_city)} />
                    <InfoRow label="Emergency Contact" value={patient.emergency_contact_name ? `${patient.emergency_contact_name} (${patient.emergency_contact_phone})` : 'N/A'} />
                </InfoCard>

                {/* Medical / Vitals Preview */}
                <InfoCard title="Recent Vitals" icon={Activity}>
                    <div className="text-center py-6 text-gray-500">
                        <p>No recent vitals recorded.</p>
                        <p className="text-sm mt-1">Vitals will be recorded during Check-in.</p>
                    </div>
                </InfoCard>
            </div>

            {/* Modals */}
            {isEditOpen && (
                <EditPatientModal
                    patient={patient}
                    onClose={() => setIsEditOpen(false)}
                    onSubmit={handlePatientUpdate}
                />
            )}

            {isCheckInOpen && (
                <CheckInModal
                    patientId={patient.id}
                    onClose={() => setIsCheckInOpen(false)}
                    onSubmit={handleCheckIn}
                />
            )}
        </div>
    );
}

// --- Sub-Components ---

function InfoCard({ title, icon: Icon, children }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-500" /> {title}
            </h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors">
            <span className="text-gray-500 text-sm font-medium">{label}</span>
            <span className="text-gray-900 text-sm text-right">{value}</span>
        </div>
    );
}

function EditPatientModal({ patient, onClose, onSubmit }: any) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(editPatientSchema),
        defaultValues: {
            firstName: patient.profiles?.first_name || '',
            lastName: patient.profiles?.last_name || '',
            email: patient.profiles?.email || '',
            phone: patient.profiles?.phone || '',
            dateOfBirth: patient.date_of_birth?.split('T')[0] || '',
            gender: patient.gender || 'male',
            bloodGroup: patient.blood_group || ''
        }
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Edit Patient Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
                        <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
                        <Input label="Email" {...register('email')} error={errors.email?.message} />
                        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
                        <Input label="Date of Birth" type="date" {...register('dateOfBirth')} error={errors.dateOfBirth?.message} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select {...register('gender')} className="w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="col-span-2 border-t pt-4 mt-2">
                            <h3 className="font-semibold text-gray-900 mb-3">Add Current Vitals (Optional)</h3>

                            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure (mmHg)</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <Input placeholder="Systolic (e.g. 120)" {...register('systolic')} />
                                    </div>
                                    <span className="text-gray-400 font-bold text-xl">/</span>
                                    <div className="flex-1">
                                        <Input placeholder="Diastolic (e.g. 80)" {...register('diastolic')} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <Input label="Pulse" placeholder="72" {...register('pulse')} />
                                <Input label="Temp" placeholder="98.6" {...register('temperature')} />
                                <Input label="Weight (kg)" placeholder="70" {...register('weight')} />
                                <Input label="Height (cm)" placeholder="170" {...register('height')} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                    <select {...register('bloodGroup')} className="w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                        <option value="">Select</option>
                                        <option value="A+">A+</option> <option value="A-">A-</option>
                                        <option value="B+">B+</option> <option value="B-">B-</option>
                                        <option value="AB+">AB+</option> <option value="AB-">AB-</option>
                                        <option value="O+">O+</option> <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CheckInModal({ patientId, onClose, onSubmit }: any) {
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);

    // Form
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(checkInSchema),
        defaultValues: { visitType: 'opd' }
    });

    const selectedDept = watch('departmentId');

    useEffect(() => {
        departmentService.getActive().then(setDepartments);
    }, []);

    useEffect(() => {
        if (selectedDept) {
            api.get('/doctors', { params: { department_id: selectedDept } })
                .then(res => setDoctors(res.data));
        } else {
            setDoctors([]);
        }
    }, [selectedDept]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-teal-50">
                    <h2 className="text-xl font-bold text-teal-900">Patient Check-In</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

                    {/* Visit Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 border-b pb-2">Visit Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select {...register('departmentId')} className="w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    <option value="">Select Department</option>
                                    {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <p className="text-red-500 text-xs">{errors.departmentId?.message}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                <select {...register('doctorId')} className="w-full rounded-md border-gray-300 shadow-sm p-2 border" disabled={!selectedDept}>
                                    <option value="">Select Doctor</option>
                                    {doctors.map((d: any) =>
                                        <option key={d.id} value={d.id}>
                                            Dr. {d.profiles?.first_name} {d.profiles?.last_name}
                                        </option>
                                    )}
                                </select>
                                <p className="text-red-500 text-xs">{errors.doctorId?.message}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Type</label>
                                <select {...register('visitType')} className="w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                    <option value="opd">OPD</option>
                                    <option value="emergency">Emergency</option>
                                    <option value="followup">Follow-up</option>
                                </select>
                            </div>
                        </div>
                        <Input label="Chief Complaint" {...register('chiefComplaint')} error={errors.chiefComplaint?.message} placeholder="Reason for visit..." />
                    </div>

                    {/* Vitals */}
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center justify-between">
                            <span>Vitals (Current)</span>
                            <span className="text-xs font-normal text-gray-500 text-right">Please update if needed</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <Input label="BP (mmHg)" placeholder="120/80" {...register('bp')} error={errors.bp?.message} />
                            <Input label="Pulse (bpm)" placeholder="72" {...register('pulse')} error={errors.pulse?.message} />
                            <Input label="Temp (°F)" placeholder="98.6" {...register('temperature')} error={errors.temperature?.message} />
                            <Input label="Weight (kg)" placeholder="70" {...register('weight')} error={errors.weight?.message} />
                            <Input label="Height (cm)" placeholder="170" {...register('height')} error={errors.height?.message} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting} className="bg-teal-600 hover:bg-teal-700">Confirm & Add to Queue</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helpers
function calculateAge(dob: string) {
    if (!dob) return 'N/A';
    return new Date().getFullYear() - new Date(dob).getFullYear();
}

function parsedAddress(street?: string, city?: string) {
    if (!street && !city) return 'N/A';
    return `${street || ''}, ${city || ''}`;
}
