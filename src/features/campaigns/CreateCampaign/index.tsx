import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../hooks/useToast';
import { campaignService } from '../../../services/campaignService';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import StepBasicInfo from './StepBasicInfo';
import StepMessage from './StepMessage';
import StepAudience from './StepAudience';
import StepSchedule from './StepSchedule';
import StepReview from './StepReview';

export interface CampaignFormData {
    // Basic Info
    name: string;
    description: string;
    channel: 'email' | 'sms' | 'both';
    campaign_type: string;

    // Message
    subject: string;
    message: string;
    template_id?: string;

    // Audience
    target_type: 'all' | 'filtered' | 'manual';
    filters: {
        gender?: string;
        age_min?: number;
        age_max?: number;
        department?: string;
    };

    // Schedule
    send_type: 'immediate' | 'scheduled';
    scheduled_at?: Date;
}

const STEPS = [
    { id: 1, name: 'Basic Info', component: StepBasicInfo },
    { id: 2, name: 'Message', component: StepMessage },
    { id: 3, name: 'Audience', component: StepAudience },
    { id: 4, name: 'Schedule', component: StepSchedule },
    { id: 5, name: 'Review', component: StepReview },
];

export default function CreateCampaign() {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CampaignFormData>({
        name: '',
        description: '',
        channel: 'email',
        campaign_type: 'general',
        subject: '',
        message: '',
        target_type: 'all',
        filters: {},
        send_type: 'immediate'
    });

    const updateFormData = (data: Partial<CampaignFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user) return;

        try {
            setIsSubmitting(true);

            // Create campaign
            const campaign = await campaignService.create({
                name: formData.name,
                description: formData.description,
                channel: formData.channel,
                campaign_type: formData.campaign_type,
                subject: formData.subject,
                message: formData.message,
                target_type: formData.target_type,
                filters: formData.filters,
                send_type: formData.send_type,
                scheduled_at: formData.scheduled_at?.toISOString(),
                created_by: user.id
            });

            // Calculate and add recipients
            const recipientCount = await campaignService.calculateRecipientCount(
                formData.target_type,
                formData.filters
            );

            toast.success(`Campaign created successfully! ${recipientCount} recipients`);
            navigate('/dashboard/admin/campaigns');
        } catch (error) {
            console.error('Failed to create campaign:', error);
            toast.error('Failed to create campaign');
        } finally {
            setIsSubmitting(false);
        }
    };

    const CurrentStepComponent = STEPS[currentStep - 1].component;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <button
                        onClick={() => navigate('/dashboard/admin/campaigns')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Campaigns
                    </button>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Create New Campaign
                    </h1>
                    <p className="text-gray-600 mt-1">Follow the steps to create your email/SMS campaign</p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${currentStep > step.id
                                            ? 'bg-green-500 text-white'
                                            : currentStep === step.id
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {currentStep > step.id ? <Check className="w-6 h-6" /> : step.id}
                                    </div>
                                    <span
                                        className={`text-sm font-semibold mt-2 ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                                            }`}
                                    >
                                        {step.name}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={`h-1 flex-1 mx-2 rounded ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 animate-fadeIn">
                    <CurrentStepComponent
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={handleNext}
                    />
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Previous
                    </button>

                    {currentStep < STEPS.length ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            Next
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Campaign'}
                            <Check className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
