import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { prescriptionService } from '../../services/prescriptionService';

import { format, parseISO } from 'date-fns';



export default function PrescriptionView() {
    const { id } = useParams<{ id: string }>();
    const [prescription, setPrescription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            prescriptionService.getById(id)
                .then((data) => {
                    setPrescription(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!prescription) return <div className="text-center py-20">Prescription not found</div>;

    // Adapted for flat structure from backend service
    const doctorName = `${prescription.doctor_first_name} ${prescription.doctor_last_name}`;
    const patientName = `${prescription.patient_first_name} ${prescription.patient_last_name}`;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none" id="prescription">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 pb-4 border-b-2">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-600">Hospital Prescription</h1>
                        <p className="text-sm text-gray-500">Phone: +1 234 567 890</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold">Dr. {doctorName}</h2>
                        {/* Note: qualifications might need to be added to service if strictly required, simplified for now to specialization */}
                        <p className="text-gray-600">{prescription.doctor_specialization || 'General Physician'}</p>
                    </div>
                </div>

                {/* Patient Info */}
                <div className="flex justify-between mb-8 bg-gray-50 p-4 rounded print:bg-transparent print:p-0">
                    <div>
                        <span className="text-gray-500 block text-xs uppercase">Patient Name</span>
                        <span className="font-semibold text-lg">{patientName}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs uppercase">Date</span>
                        <span className="font-semibold">{format(new Date(prescription.created_at!), 'MMM d, yyyy')}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs uppercase">ID</span>
                        <span className="font-semibold">#{prescription.id.slice(0, 8)}</span>
                    </div>
                </div>

                {/* Instructions */}
                {prescription.instructions && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold border-b mb-2 pb-1">Instructions</h3>
                        <p>{prescription.instructions}</p>
                    </div>
                )}

                {/* Rx - Medicines */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold border-b mb-4 pb-1">Rx (Medicines)</h3>
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-gray-500 text-sm border-b">
                                <th className="pb-2">Medicine</th>
                                <th className="pb-2">Dosage</th>
                                <th className="pb-2">Frequency</th>
                                <th className="pb-2">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {((prescription.items as any[]) || []).map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="py-3 font-medium">{item.medicine_name}</td>
                                    <td className="py-3">{item.dosage}</td>
                                    <td className="py-3">{item.frequency}</td>
                                    <td className="py-3">{item.duration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
                    <p className="mb-2">This is a digitally generated prescription</p>
                    <p>For any queries, please contact the hospital</p>
                </div>
            </div>

            {/* Print Button */}
            <div className="mt-6 text-center print:hidden">
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    Print Prescription
                </button>
            </div>
        </div>
    );
}
