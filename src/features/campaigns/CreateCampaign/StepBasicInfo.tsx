import { Mail, MessageSquare, TrendingUp } from 'lucide-react';
import type { CampaignFormData } from './index';

interface Props {
    formData: CampaignFormData;
    updateFormData: (data: Partial<CampaignFormData>) => void;
    onNext: () => void;
}

export default function StepBasicInfo({ formData, updateFormData, onNext }: Props) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.channel) {
            onNext();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

            {/* Campaign Name */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder="e.g., Summer Health Checkup Promotion"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                    required
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Brief description of this campaign..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                />
            </div>

            {/* Channel Selection */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                    Channel <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        type="button"
                        onClick={() => updateFormData({ channel: 'email' })}
                        className={`p-6 rounded-xl border-2 transition-all ${formData.channel === 'email'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <Mail className={`w-8 h-8 mx-auto mb-2 ${formData.channel === 'email' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className="font-bold text-gray-900">Email</p>
                        <p className="text-xs text-gray-600 mt-1">Send via email</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData({ channel: 'sms' })}
                        className={`p-6 rounded-xl border-2 transition-all ${formData.channel === 'sms'
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${formData.channel === 'sms' ? 'text-green-600' : 'text-gray-400'}`} />
                        <p className="font-bold text-gray-900">SMS</p>
                        <p className="text-xs text-gray-600 mt-1">Send via text</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData({ channel: 'both' })}
                        className={`p-6 rounded-xl border-2 transition-all ${formData.channel === 'both'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${formData.channel === 'both' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <p className="font-bold text-gray-900">Both</p>
                        <p className="text-xs text-gray-600 mt-1">Email + SMS</p>
                    </button>
                </div>
            </div>

            {/* Campaign Type */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Campaign Type
                </label>
                <select
                    value={formData.campaign_type}
                    onChange={(e) => updateFormData({ campaign_type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                >
                    <option value="general">General</option>
                    <option value="appointment_reminder">Appointment Reminder</option>
                    <option value="health_tip">Health Tips</option>
                    <option value="promotional">Promotional</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="birthday">Birthday Wishes</option>
                </select>
            </div>

            <button
                type="submit"
                className="hidden" // Hidden button for form submission on Enter
            >
                Submit
            </button>
        </form>
    );
}
