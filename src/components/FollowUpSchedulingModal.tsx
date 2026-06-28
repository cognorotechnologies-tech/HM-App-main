import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { followUpService } from '../services/followUpService';
import { useToast } from '../hooks/useToast';

interface FollowUpSchedulingModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    doctorId: string;
    appointmentId: string;
    onScheduled: () => void;
}

export const FollowUpSchedulingModal: React.FC<FollowUpSchedulingModalProps> = ({
    isOpen, onClose, patientId, doctorId, appointmentId, onScheduled
}) => {
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) {
            toast.error('Please select a date');
            return;
        }

        try {
            setLoading(true);
            await followUpService.create({
                patient_id: patientId,
                doctor_id: doctorId,
                appointment_id: appointmentId,
                follow_up_date: date,
                reason,
                status: 'scheduled'
            });
            toast.success('Follow-up scheduled successfully');
            onScheduled();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to schedule follow-up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-scaleIn">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600" />
                        Schedule Follow-up
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Check blood pressure, Review lab results..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none transition-all"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Scheduling...' : 'Confirm Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
