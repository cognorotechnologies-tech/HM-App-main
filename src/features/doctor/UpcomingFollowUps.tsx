import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { followUpService } from '../../services/followUpService';
import { format } from 'date-fns';

interface UpcomingFollowUpsProps {
    doctorId: string;
}

export const UpcomingFollowUps: React.FC<UpcomingFollowUpsProps> = ({ doctorId }) => {
    const [followUps, setFollowUps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFollowUps();
    }, [doctorId]);

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            const data = await followUpService.getUpcoming(doctorId);
            setFollowUps(data || []);
        } catch (error) {
            console.error('Failed to load upcoming follow-ups', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-48 bg-white rounded-xl shadow-sm animate-pulse"></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
                    Upcoming Follow-ups
                </h3>
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {followUps.length} Pending
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {followUps.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No follow-ups scheduled.</p>
                    </div>
                ) : (
                    followUps.map((item) => (
                        <div key={item.id} className="p-3 border border-gray-100 rounded-lg hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/patient/${item.patient_id}`)}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {item.first_name} {item.last_name}
                                </h4>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Clock size={10} />
                                    {format(new Date(item.follow_up_date), 'MMM d')}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">{item.reason || 'Regular checkup'}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
