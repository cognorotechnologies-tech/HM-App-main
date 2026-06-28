import { Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { FamilyMemberList } from './FamilyMemberList';

export default function FamilyManagement() {
    const { user } = useAuthStore();

    // In real app, check if user is patient
    const patientId = user?.id;

    if (!patientId) return <div>Please log in.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Users className="text-blue-600" />
                    Family Management
                </h1>
                <p className="text-gray-500 mt-2">Add family members to book appointments for them easily.</p>
            </header>

            <FamilyMemberList patientId={patientId} />
        </div>
    );
}
