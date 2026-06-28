import { useState } from 'react';
import { FileText } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';

export default function MedicalDocuments() {
    const { user } = useAuthStore();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (!user) {
        return <div>Please log in to access medical documents</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Medical Documents</h1>
                </div>
                <p className="text-gray-600">
                    Upload and manage your medical reports, X-rays, prescriptions, and other health documents
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Section */}
                <div className="lg:col-span-1">
                    <DocumentUpload
                        patientId={user.id}
                        onUploadComplete={handleUploadComplete}
                    />
                </div>

                {/* Documents List */}
                <div className="lg:col-span-2">
                    <DocumentList
                        patientId={user.id}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>
        </div>
    );
}
