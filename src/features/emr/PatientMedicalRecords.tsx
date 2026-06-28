import { useState } from 'react';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { useAuthStore } from '../../store/authStore';

export default function PatientMedicalRecords() {
    const { user } = useAuthStore();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Assuming the logged-in user is the patient for now
    // In a real scenario, we might be an admin viewing, so logic would differ.
    // But for the "Patient Portal" enhancement, auth.uid is the patient.
    const patientId = user?.id;

    if (!patientId) return <div>Please log in to view medical records.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                <p className="text-gray-500 mt-2">Manage your health documents, prescriptions, and reports.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: List */}
                <div className="lg:col-span-2">
                    <DocumentList patientId={patientId} refreshTrigger={refreshTrigger} />
                </div>

                {/* Right Column: Upload */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <DocumentUpload
                            patientId={patientId}
                            onUploadSuccess={() => setRefreshTrigger(prev => prev + 1)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
