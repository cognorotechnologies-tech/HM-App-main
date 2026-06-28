import { Mail, MessageSquare, TrendingUp, Users, Calendar, Send, CheckCircle2 } from 'lucide-react';
import type { CampaignFormData } from './index';

interface Props {
    formData: CampaignFormData;
    updateFormData: (data: Partial<CampaignFormData>) => void;
    onNext: () => void;
}

export default function StepReview({ formData }: Props) {
    const channelIcons = {
        email: <Mail className="w-6 h-6" />,
        sms: <MessageSquare className="w-6 h-6" />,
        both: <TrendingUp className="w-6 h-6" />
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Your Campaign</h2>
                <p className="text-gray-600">Double-check everything before creating your campaign</p>
            </div>

            {/* Campaign Overview */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Campaign Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Campaign Name</p>
                        <p className="font-bold text-gray-900 text-lg">{formData.name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-1">Channel</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.channel === 'email' ? 'bg-blue-100 text-blue-600' :
                                    formData.channel === 'sms' ? 'bg-green-100 text-green-600' :
                                        'bg-purple-100 text-purple-600'
                                }`}>
                                {channelIcons[formData.channel]}
                            </div>
                            <span className="font-bold text-gray-900 capitalize">{formData.channel}</span>
                        </div>
                    </div>

                    {formData.description && (
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-600 mb-1">Description</p>
                            <p className="text-gray-900">{formData.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Preview */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Message</h3>

                {(formData.channel === 'email' || formData.channel === 'both') && formData.subject && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Subject:</p>
                        <p className="font-bold text-gray-900">{formData.subject}</p>
                    </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Message Body:</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{formData.message}</p>
                </div>
            </div>

            {/* Audience */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Target Audience</h3>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 capitalize">{formData.target_type} Patients</p>
                        {formData.target_type === 'filtered' && (
                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                                {formData.filters.gender && <p>• Gender: {formData.filters.gender}</p>}
                                {(formData.filters.age_min || formData.filters.age_max) && (
                                    <p>• Age: {formData.filters.age_min || '0'} - {formData.filters.age_max || '120'} years</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Schedule</h3>

                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.send_type === 'immediate' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                        {formData.send_type === 'immediate' ? (
                            <Send className="w-6 h-6 text-green-600" />
                        ) : (
                            <Calendar className="w-6 h-6 text-blue-600" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">
                            {formData.send_type === 'immediate' ? 'Send Immediately' : 'Scheduled'}
                        </p>
                        {formData.send_type === 'scheduled' && formData.scheduled_at && (
                            <p className="text-sm text-gray-600">
                                {formData.scheduled_at.toLocaleString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Final Note */}
            <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
                <p className="text-sm text-gray-700">
                    <span className="font-bold">⚠️ Important:</span>{' '}
                    Once created, {formData.send_type === 'immediate' ? 'this campaign will start sending immediately' : 'this campaign will be queued for sending'}.
                    Make sure all details are correct before proceeding.
                </p>
            </div>
        </div>
    );
}
