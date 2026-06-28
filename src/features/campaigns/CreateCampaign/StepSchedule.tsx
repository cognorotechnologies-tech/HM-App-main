import { Calendar, Clock, Send } from 'lucide-react';
import type { CampaignFormData } from './index';

interface Props {
    formData: CampaignFormData;
    updateFormData: (data: Partial<CampaignFormData>) => void;
    onNext: () => void;
}

export default function StepSchedule({ formData, updateFormData, onNext }: Props) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    const handleDateTimeChange = (date: string, time: string) => {
        if (date && time) {
            const scheduled = new Date(`${date}T${time}`);
            updateFormData({ scheduled_at: scheduled });
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Campaign</h2>

            {/* Send Type Selection */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                    When should this campaign be sent?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => updateFormData({ send_type: 'immediate', scheduled_at: undefined })}
                        className={`p-8 rounded-xl border-2 transition-all ${formData.send_type === 'immediate'
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <Send className={`w-12 h-12 mx-auto mb-3 ${formData.send_type === 'immediate' ? 'text-green-600' : 'text-gray-400'}`} />
                        <p className="font-bold text-gray-900 text-lg mb-1">Send Immediately</p>
                        <p className="text-sm text-gray-600">Campaign will be sent right after creation</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData({ send_type: 'scheduled' })}
                        className={`p-8 rounded-xl border-2 transition-all ${formData.send_type === 'scheduled'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <Calendar className={`w-12 h-12 mx-auto mb-3 ${formData.send_type === 'scheduled' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className="font-bold text-gray-900 text-lg mb-1">Schedule for Later</p>
                        <p className="text-sm text-gray-600">Choose a specific date and time</p>
                    </button>
                </div>
            </div>

            {/* Schedule Date/Time (if scheduled) */}
            {formData.send_type === 'scheduled' && (
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 space-y-4">
                    <h3 className="font-bold text-gray-900 mb-4">Select Date & Time</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    min={today}
                                    value={formData.scheduled_at ? formData.scheduled_at.toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                        const time = formData.scheduled_at?.toTimeString().slice(0, 5) || now;
                                        handleDateTimeChange(e.target.value, time);
                                    }}
                                    className="w-full px-4 py-3 pl-11 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                    required
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Time <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="time"
                                    value={formData.scheduled_at ? formData.scheduled_at.toTimeString().slice(0, 5) : ''}
                                    onChange={(e) => {
                                        const date = formData.scheduled_at?.toISOString().split('T')[0] || today;
                                        handleDateTimeChange(date, e.target.value);
                                    }}
                                    className="w-full px-4 py-3 pl-11 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                    required
                                />
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {formData.scheduled_at && (
                        <div className="bg-white rounded-lg p-4 mt-4">
                            <p className="text-sm text-gray-600 mb-1">Scheduled for:</p>
                            <p className="text-lg font-bold text-gray-900">
                                {formData.scheduled_at.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                                {' at '}
                                {formData.scheduled_at.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Info Box */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <p className="text-sm text-gray-700">
                    <span className="font-bold">💡 Tip:</span>{' '}
                    {formData.send_type === 'immediate'
                        ? 'Your campaign will start sending immediately after you click "Create Campaign".'
                        : 'Your campaign will be queued and automatically sent at the scheduled time.'}
                </p>
            </div>

            <button type="submit" className="hidden">Submit</button>
        </form>
    );
}
