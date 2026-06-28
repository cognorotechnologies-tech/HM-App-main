import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { prescriptionService } from '../../services/prescriptionService';
import { patientService, Patient } from '../../services/patientService';
import { prescriptionCustomizationService, PrescriptionPreferences } from '../../services/prescriptionCustomizationService';
import { format } from 'date-fns';
import { Printer, Calendar, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../../components/Button';

export default function PrescriptionPrint() {
    const { id } = useParams<{ id: string }>();
    const [prescription, setPrescription] = useState<any>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [preferences, setPreferences] = useState<PrescriptionPreferences | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (presId: string) => {
        try {
            setLoading(true);
            let presData = await prescriptionService.getById(presId).catch(() => null);

            // Fallback: If not found by ID, try finding by Appointment ID
            if (!presData) {
                const byAppt = await prescriptionService.getByAppointment(presId).catch(() => null);
                if (byAppt && byAppt.length > 0) {
                    // Use the most recent prescription for this appointment
                    presData = byAppt[byAppt.length - 1]; // Assuming order or sorting might be needed, but usually last created
                }
            }

            const prefsData = await prescriptionCustomizationService.getPreferences().catch(() => null); // Fallback if fails

            setPrescription(presData);
            setPreferences(prefsData);

            if (presData && presData.patient_id) {
                const patientData = await patientService.getById(presData.patient_id);
                setPatient(patientData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Preparing document...</p>
        </div>
    );

    if (!prescription) return <div className="p-8 text-center text-red-600">Prescription not found.</div>;

    const { medicines, diagnosis, instructions, follow_up_date, created_at, prescription_number } = prescription;

    // Use preferences or defaults
    const showHeader = preferences?.show_header ?? true;
    const showLogo = preferences?.show_logo ?? true;
    const showSignature = preferences?.show_signature ?? true;
    const primaryColor = preferences?.primary_color || '#1e3a8a'; // Blue-900 default
    const fontFamily = preferences?.font_family || 'Inter'; // Default font

    // Dynamic Stylings
    const headerStyle = { borderBottomColor: primaryColor };
    const titleStyle = { color: primaryColor };
    const sectionTitleStyle = { color: '#9ca3af' }; // gray-400

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 print:bg-white print:py-0" style={{ fontFamily }}>
            {/* Action Bar */}
            <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center print:hidden px-4">
                <h1 className="text-xl font-bold text-gray-800">Print Preview</h1>
                <Button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700">
                    <Printer size={18} /> Print Now
                </Button>
            </div>

            {/* A4 Page Container */}
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none p-12 relative flex flex-col justify-between print:p-[15mm]" id="print-area">

                {/* Header / Letterhead */}
                {showHeader && (
                    <header className="border-b-4 pb-6 mb-8 flex justify-between items-end" style={headerStyle}>
                        <div className="flex items-center gap-4">
                            {showLogo && preferences?.logo_url && (
                                <img src={preferences.logo_url} alt="Logo" className="h-16 w-auto object-contain" />
                            )}
                            <div>
                                {preferences?.header_text ? (
                                    <h1 className="text-3xl font-extrabold tracking-tight whitespace-pre-wrap" style={titleStyle}>{preferences.header_text}</h1>
                                ) : (
                                    <h1 className="text-4xl font-extrabold tracking-tight" style={titleStyle}>MEDI<span className="text-blue-500">CARE</span></h1>
                                )}
                                <p className="text-sm text-gray-500 font-medium tracking-widest uppercase mt-1">Excellence in Healthcare</p>
                            </div>
                        </div>
                        <div className="text-right text-sm text-gray-600 space-y-1">
                            {/* In a real app, strict doctor clinic details would come from profile/settings */}
                            <p className="flex items-center justify-end gap-2"><MapPin size={14} /> Medical Centre, 123 Health Ave</p>
                            <p className="flex items-center justify-end gap-2"><Phone size={14} /> +1 (555) 123-4567</p>
                            <p className="flex items-center justify-end gap-2"><Mail size={14} /> contact@medicare.com</p>
                        </div>
                    </header>
                )}

                {/* Patient & Doctor Grid */}
                <div className="grid grid-cols-2 gap-12 mb-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={sectionTitleStyle}>Doctor</p>
                        <h2 className="text-xl font-bold text-gray-800">Dr. {prescription.doctor_first_name} {prescription.doctor_last_name}</h2>
                        <p className="font-medium" style={{ color: primaryColor }}>{prescription.doctor_specialization || 'General Physician'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={sectionTitleStyle}>Patient</p>
                        <h2 className="text-xl font-bold text-gray-800">{patient?.first_name || prescription.patient_first_name} {patient?.last_name || prescription.patient_last_name}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                            {patient?.date_of_birth && (
                                <span>Age: {calculateAge(patient.date_of_birth)} / {patient.gender ? patient.gender[0].toUpperCase() : ''}</span>
                            )}
                            {patient?.blood_group && (
                                <span className="bg-gray-100 px-1.5 rounded text-xs font-bold tracking-wide pt-0.5">{patient.blood_group}</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">ID: #{prescription.patient_id?.slice(0, 8)}</p>
                    </div>
                </div>

                {/* Meta Bar */}
                <div className="mb-8 border-b border-gray-100 pb-2 flex justify-between text-sm">
                    <span className="text-gray-500">Date: <span className="font-semibold text-gray-800">{safeFormatDate(created_at)}</span></span>
                    <span className="text-gray-500">Rx #: <span className="font-mono text-gray-800">{prescription_number || prescription.id.slice(0, 8)}</span></span>
                </div>

                {/* Diagnosis */}
                {diagnosis && (
                    <div className="mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={sectionTitleStyle}>Diagnosis</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 text-gray-800 whitespace-pre-wrap" style={{ borderLeftColor: primaryColor }}>
                            {diagnosis}
                        </div>
                    </div>
                )}

                {/* Medicines */}
                <div className="mb-8 pl-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={sectionTitleStyle}>
                        <span className="text-3xl font-serif text-gray-900 leading-none">Rx</span> Medications
                    </h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-200 text-left">
                                <th className="py-2 font-bold text-gray-700 w-[35%]">Medicine</th>
                                <th className="py-2 font-bold text-gray-700">Dosage</th>
                                <th className="py-2 font-bold text-gray-700">Freq</th>
                                <th className="py-2 font-bold text-gray-700">Duration</th>
                                <th className="py-2 font-bold text-gray-700">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(medicines || []).map((med: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-3 font-semibold text-gray-900">{med.medicine_name}</td>
                                    <td className="py-3 text-gray-600">{med.dosage}</td>
                                    <td className="py-3">
                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono border border-gray-200">
                                            {med.frequency}
                                        </span>
                                    </td>
                                    <td className="py-3 text-gray-600">{med.duration}</td>
                                    <td className="py-3 text-gray-500 text-xs italic">{med.timing}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Advice/Instructions */}
                {(instructions || '').replace(new RegExp(`Follow up on:.*`), '').trim() && (
                    <div className="mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-2" style={sectionTitleStyle}>Advice</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {instructions.replace(new RegExp(`Follow up on:.*`), '').trim()}
                        </p>
                    </div>
                )}

                {/* Footer / Follow Up */}
                <div className="mt-auto pt-8 border-t-2 border-gray-100 flex justify-between items-end">

                    {/* Follow Up Badge */}
                    {follow_up_date ? (
                        <div
                            className="text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-4 print:shadow-none print:border print:bg-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <div className="bg-white/20 p-2 rounded-full print:hidden">
                                <Calendar size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xs uppercase opacity-75 font-semibold tracking-wider print:text-gray-500">Next Follow Up</p>
                                <p className="text-2xl font-bold print:text-black">{safeFormatDate(follow_up_date)}</p>
                            </div>
                        </div>
                    ) : (
                        <div></div>
                    )}

                    {/* Signature */}
                    <div className="text-center min-w-[200px]">
                        <div className="h-20 mb-2 border-b border-gray-300 flex items-end justify-center">
                            {showSignature && preferences?.signature_url ? (
                                <img src={preferences.signature_url} alt="Signature" className="h-16 w-auto object-contain mb-1" />
                            ) : (
                                <span className="font-cursive text-3xl text-gray-300 relative top-2 opacity-50">
                                    {prescription.doctor_last_name}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Doctor's Signature</p>
                        <p className="text-xs text-gray-400 mt-0.5">Dr. {prescription.doctor_first_name} {prescription.doctor_last_name}</p>
                    </div>
                </div>

                {/* Print Footer Meta */}
                <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-gray-400 print:block hidden">
                    {preferences?.footer_text || `Generated by Hospital Management System • ${new Date().toLocaleString()}`}
                </div>
            </div>

            <style type="text/css" media="print">
                {`
                    @page { size: auto; margin: 0mm; }
                    body { background-color: white; }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
                    .print\\:p-\\[15mm\\] { padding: 15mm !important; }
                    .print\\:block { display: block !important; }
                `}
            </style>
        </div>
    );
}

function safeFormatDate(dateStr: string) {
    if (!dateStr) return '';
    try {
        return format(new Date(dateStr), 'MMMM d, yyyy');
    } catch (e) {
        return dateStr;
    }
}

function calculateAge(dob: string) {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
