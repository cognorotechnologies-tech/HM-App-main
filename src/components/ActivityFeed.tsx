import { useEffect, useState } from 'react';
import { appointmentService } from '../services/appointmentService';

interface Activity {
    id: string;
    type: 'appointment' | 'patient' | 'consultation';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentActivities();
    }, []);

    async function fetchRecentActivities() {
        try {
            // Fetch recent appointments
            // Assuming getAll returns list, we sort and slice client side for now if backend doesn't support limit
            const appointments = await appointmentService.getAll();

            // Sort by date desc
            const sorted = (appointments || []).sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ).slice(0, 5);

            const formattedActivities: Activity[] = sorted.map((apt, idx) => ({
                id: apt.id || idx.toString(),
                type: 'appointment' as const,
                title: 'New Appointment',
                description: `Appointment scheduled - Status: ${apt.status}`,
                timestamp: new Date(apt.appointment_date).toLocaleString(),
                icon: '📅',
            }));

            setActivities(formattedActivities);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl">
                                {activity.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                <p className="text-sm text-gray-600">{activity.description}</p>
                                <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
