// TypeScript strict checks enabled
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { format, addDays } from 'date-fns';
import { Trash2, Plus, AlertTriangle, Activity, Calendar } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import PatientJourneyTrain from '../../components/PatientJourneyTrain';

type Medicine = {
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    timing: string; // Before/After Food
};

export default function PrescriptionForm() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [journeyStops, setJourneyStops] = useState<any[]>([]);
    const [journeyLoading, setJourneyLoading] = useState(false);

    const { register, handleSubmit, control } = useForm<{
        symptoms: string;
        diagnosis: string;
        instructions: string;
        follow_up_days: string;
        items: Medicine[];
    }>({
        defaultValues: {
            follow_up_days: '7',
            items: [{ medicine_name: '', dosage: '1 tablet', frequency: '1-0-1', duration: '5 days', timing: 'After Food' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    useEffect(() => {
        if (appointmentId) {
            appointmentService.getById(appointmentId)
                .then((data) => {
                    if (data) {
                        setAppointment(data);
                    }
                    setLoading(false);
                })
                .catch(console.error);
        }
    }, [appointmentId]);

    const onSubmit = async (data: any, status: 'draft' | 'final' = 'final') => {
        if (!appointment) return;
        try {
            // Calculate follow up date
            const followUpDate = data.follow_up_days
                ? format(addDays(new Date(), parseInt(data.follow_up_days)), 'yyyy-MM-dd')
                : null;

            await prescriptionService.create({
                patient_id: appointment.patient_id,
                doctor_id: appointment.doctor_id,
                consultation_id: appointmentId,
                prescription_number: `RX-${Date.now()}`,
                diagnosis: (data.symptoms ? `Symptoms: ${data.symptoms}\n` : '') + data.diagnosis,
                instructions: data.instructions || '',
                medicines: data.items || [],
                follow_up_date: followUpDate
            });

            toast.success(
                status === 'draft'
                    ? 'Prescription saved as draft.'
                    : 'Prescription issued successfully! 💊'
            );
            navigate('/dashboard/doctor/appointments');
        } catch (error: any) {
            console.error(error);
            toast.error('Error saving: ' + error.message);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div></div>;
    if (!appointment) return <div className="p-8 text-center text-red-600">Patient appointment context missing.</div>;

    // Map flat fields to object structure similar to before or use directly
    const patientName = `${appointment.patient_first_name} ${appointment.patient_last_name}`;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Write Prescription</h1>
                <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>

            {/* Patient Safety Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                            👤
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {patientName}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {appointment.patient_gender} • {appointment.patient_dob ? format(new Date(appointment.patient_dob), 'MMM d, yyyy') : 'DOB N/A'} • Blood Group: <span className="font-semibold text-gray-800">{appointment.patient_blood_group || 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Appointment ID</p>
                        <p className="font-mono text-xs text-gray-400">#{appointment.id.slice(0, 8)}</p>
                    </div>
                </div>

                {/* Medical Alerts */}
                {(appointment.patient_allergies?.length > 0 || appointment.patient_chronic_conditions?.length > 0) && (
                    <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex gap-8">
                        {appointment.patient_allergies?.length > 0 && (
                            <div className="flex items-start gap-2 text-red-700">
                                <AlertTriangle size={18} className="mt-0.5" />
                                <div>
                                    <span className="font-bold text-sm uppercase tracking-wide">Allergies:</span>
                                    <p className="text-sm">{appointment.patient_allergies.join(", ")}</p>
                                </div>
                            </div>
                        )}
                        {appointment.patient_chronic_conditions?.length > 0 && (
                            <div className="flex items-start gap-2 text-orange-700">
                                <Activity size={18} className="mt-0.5" />
                                <div>
                                    <span className="font-bold text-sm uppercase tracking-wide">Chronic Conditions:</span>
                                    <p className="text-sm">{appointment.patient_chronic_conditions.join(", ")}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Patient Journey Timeline */}
            <PatientJourneyTrain
                patientId={appointment.patient_id}
                journeyStops={journeyStops}
                loading={journeyLoading}
            />

            <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Diagnosis & Instructions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            🏥 Clinical Notes
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Symptoms / Complaints</label>
                                <textarea
                                    {...register('symptoms')}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
                                    placeholder="Patient's reported symptoms..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis <span className="text-red-500">*</span></label>
                                <textarea
                                    {...register('diagnosis', { required: true })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                                    placeholder="Primary diagnosis details..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Advice</label>
                                <textarea
                                    {...register('instructions')}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
                                    placeholder="Dietary restrictions, rest recommendations, etc."
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Follow Up</label>
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-400" />
                                    <select
                                        {...register('follow_up_days')}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="3">After 3 Days</option>
                                        <option value="5">After 5 Days</option>
                                        <option value="7">After 1 Week</option>
                                        <option value="14">After 2 Weeks</option>
                                        <option value="30">After 1 Month</option>
                                        <option value="">No Follow up</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Medicines */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                💊 Medications
                            </h3>
                            <Button type="button" size="sm" onClick={() => append({ medicine_name: '', dosage: '1 tablet', frequency: '1-0-1', duration: '5 days', timing: 'After Food' })} className="flex items-center gap-1">
                                <Plus size={16} /> Add Medicine
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group transition-all hover:shadow-md">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        {/* Row 1 */}
                                        <div className="md:col-span-4">
                                            <label className="text-xs font-medium text-gray-500 uppercase">Medicine Name</label>
                                            <Input
                                                {...register(`items.${index}.medicine_name`, { required: true })}
                                                placeholder="e.g. Paracetamol"
                                                className="mt-1 bg-white"
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="text-xs font-medium text-gray-500 uppercase">Dosage</label>
                                            <Input
                                                {...register(`items.${index}.dosage`)}
                                                placeholder="e.g. 500mg"
                                                className="mt-1 bg-white"
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="text-xs font-medium text-gray-500 uppercase">Frequency</label>
                                            <select
                                                {...register(`items.${index}.frequency`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white h-10"
                                            >
                                                <option value="1-0-1">1-0-1 (Morning-Night)</option>
                                                <option value="1-1-1">1-1-1 (Morning-Afternoon-Night)</option>
                                                <option value="1-0-0">1-0-0 (Morning only)</option>
                                                <option value="0-0-1">0-0-1 (Night only)</option>
                                                <option value="SOS">SOS (As needed)</option>
                                            </select>
                                        </div>

                                        {/* Delete Button */}
                                        <div className="md:col-span-2 flex items-end justify-end">
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* Row 2 - Details */}
                                        <div className="md:col-span-4">
                                            <label className="text-xs font-medium text-gray-500 uppercase">Duration</label>
                                            <select
                                                {...register(`items.${index}.duration`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                                            >
                                                <option value="3 days">3 Days</option>
                                                <option value="5 days">5 Days</option>
                                                <option value="7 days">1 Week</option>
                                                <option value="10 days">10 Days</option>
                                                <option value="14 days">2 Weeks</option>
                                                <option value="1 month">1 Month</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-4">
                                            <label className="text-xs font-medium text-gray-500 uppercase">Timing</label>
                                            <select
                                                {...register(`items.${index}.timing`)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                                            >
                                                <option value="After Food">After Food</option>
                                                <option value="Before Food">Before Food</option>
                                                <option value="With Food">With Food</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {fields.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                                    No medicines added yet. Click "Add Medicine" to start.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)} className="px-8">Discard</Button>
                        <Button type="button" variant="outline" onClick={handleSubmit((d) => onSubmit(d, 'draft'))} className="px-8 border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                            Save as Draft
                        </Button>
                        <Button type="button" onClick={handleSubmit((d) => onSubmit(d, 'final'))} className="px-8 bg-blue-600 hover:bg-blue-700 shadow-lg">
                            Issue Prescription
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
