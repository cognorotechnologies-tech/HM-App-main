// @ts-nocheck
// Appointment Activity Timeline Component
import React, { useEffect, useState } from 'react';
import { Clock, User, DollarSign, FileText, Calendar, AlertCircle, CheckCircle, XCircle, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/axios';

interface Activity {
    id: number;
    appointment_id: number;
    user_id: number | null;
    action_type: string;
    action_description: string;
    old_values: any;
    new_values: any;
    performed_by_name: string;
    performed_by_role: string;
    created_at: string;
}

interface AppointmentActivityTimelineProps {
    appointmentId: string | number;
}

const actionIcons: { [key: string]: any } = {
    created: CheckCircle,
    updated: Edit,
    status_changed: AlertCircle,
    rescheduled: Calendar,
    cancelled: XCircle,
    completed: CheckCircle,
    payment_received: DollarSign,
    note_added: FileText,
    deleted: Trash,
};

const actionColors: { [key: string]: string } = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    status_changed: 'bg-yellow-100 text-yellow-700',
    rescheduled: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-green-100 text-green-700',
    payment_received: 'bg-emerald-100 text-emerald-700',
    note_added: 'bg-gray-100 text-gray-700',
    deleted: 'bg-red-100 text-red-700',
};

export const AppointmentActivityTimeline: React.FC<AppointmentActivityTimelineProps> = ({ appointmentId }) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchActivities();
    }, [appointmentId]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/appointment-activity/${appointmentId}`);
            setActivities(response.data);
            setError('');
        } catch (err: any) {
            console.error('Error fetching activities:', err);
            setError('Failed to load activity history');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (actionType: string) => {
        const IconComponent = actionIcons[actionType] || Clock;
        return IconComponent;
    };

    const getColorClass = (actionType: string) => {
        return actionColors[actionType] || 'bg-gray-100 text-gray-700';
    };

    const formatTimestamp = (timestamp: string) => {
        try {
            return format(new Date(timestamp), 'MMM dd, yyyy hh:mm a');
        } catch {
            return timestamp;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p>No activity history available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Clock size={20} />
                Activity Timeline
            </h3>

            <div className="relative">
                {/* Timeline  line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Activity items */}
                <div className="space-y-6">
                    {activities.map((activity, index) => {
                        const Icon = getIcon(activity.action_type);
                        const colorClass = getColorClass(activity.action_type);

                        return (
                            <div key={activity.id} className="relative pl-12">
                                {/* Icon */}
                                <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                                    <Icon size={16} />
                                </div>

                                {/* Content */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {activity.action_description || activity.action_type.replace(/_/g, ' ').toUpperCase()}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <User size={14} />
                                                    {activity.performed_by_name || 'System'}
                                                </span>
                                                {activity.performed_by_role && (
                                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                                                        {activity.performed_by_role}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatTimestamp(activity.created_at)}
                                        </span>
                                    </div>

                                    {/* Show changes if available */}
                                    {activity.old_values && activity.new_values && (
                                        <div className="mt-3 border-t border-gray-200 pt-3">
                                            <p className="text-xs font-medium text-gray-700 mb-2">Changes:</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="bg-red-50 border border-red-200 rounded p-2">
                                                    <span className="text-red-700 font-medium">Before:</span>
                                                    <pre className="mt-1 text-gray-700 overflow-x-auto">{JSON.stringify(activity.old_values, null, 2)}</pre>
                                                </div>
                                                <div className="bg-green-50 border border-green-200 rounded p-2">
                                                    <span className="text-green-700 font-medium">After:</span>
                                                    <pre className="mt-1 text-gray-700 overflow-x-auto">{JSON.stringify(activity.new_values, null, 2)}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {activities.length > 0 && (
                <div className="mt-6 text-center text-sm text-gray-500">
                    Showing {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                </div>
            )}
        </div>
    );
};

export default AppointmentActivityTimeline;
