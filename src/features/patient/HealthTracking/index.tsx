import { useState } from 'react';
import { Activity } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import MetricEntry from './MetricEntry';
import MetricCharts from './MetricCharts';

export default function HealthTracking() {
    const { user } = useAuthStore();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    if (!user) {
        return <div>Please log in to access health tracking</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Health Tracking</h1>
                </div>
                <p className="text-gray-600">
                    Monitor your health metrics including blood pressure, blood sugar, weight, and more
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Entry Form */}
                <div className="lg:col-span-1">
                    <MetricEntry
                        patientId={user.id}
                        onSuccess={handleSuccess}
                    />
                </div>

                {/* Charts */}
                <div className="lg:col-span-2">
                    <MetricCharts
                        patientId={user.id}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>
        </div>
    );
}
