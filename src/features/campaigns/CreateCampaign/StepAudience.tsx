import { useState, useEffect } from 'react';
import { Users, Filter } from 'lucide-react';
import { campaignService } from '../../../services/campaignService';
import type { CampaignFormData } from './index';

interface Props {
    formData: CampaignFormData;
    updateFormData: (data: Partial<CampaignFormData>) => void;
    onNext: () => void;
}

export default function StepAudience({ formData, updateFormData, onNext }: Props) {
    const [recipientCount, setRecipientCount] = useState<number>(0);
    const [loadingCount, setLoadingCount] = useState(false);

    useEffect(() => {
        calculateRecipientCount();
    }, [formData.target_type, formData.filters]);

    const calculateRecipientCount = async () => {
        try {
            setLoadingCount(true);
            const count = await campaignService.calculateRecipientCount(
                formData.target_type,
                formData.filters
            );
            setRecipientCount(count);
        } catch (error) {
            console.error('Failed to calculate recipients:', error);
        } finally {
            setLoadingCount(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Target Audience</h2>

            {/* Targeting Type */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                    Who should receive this campaign?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        type="button"
                        onClick={() => updateFormData({ target_type: 'all', filters: {} })}
                        className={`p-6 rounded-xl border-2 transition-all ${formData.target_type === 'all'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <Users className={`w-8 h-8 mx-auto mb-2 ${formData.target_type === 'all' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className="font-bold text-gray-900">All Patients</p>
                        <p className="text-xs text-gray-600 mt-1">Send to everyone</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData({ target_type: 'filtered' })}
                        className={`p-6 rounded-xl border-2 transition-all ${formData.target_type === 'filtered'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <Filter className={`w-8 h-8 mx-auto mb-2 ${formData.target_type === 'filtered' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <p className="font-bold text-gray-900">Filtered</p>
                        <p className="text-xs text-gray-600 mt-1">Apply filters</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => updateFormData({ target_type: 'manual' })}
                        className={`p-6 rounded-xl border-2 transition-all ${formData.target_type === 'manual'
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <Users className={`w-8 h-8 mx-auto mb-2 ${formData.target_type === 'manual' ? 'text-green-600' : 'text-gray-400'}`} />
                        <p className="font-bold text-gray-900">Manual List</p>
                        <p className="text-xs text-gray-600 mt-1">Upload CSV</p>
                    </button>
                </div>
            </div>

            {/* Filters (if filtered is selected) */}
            {formData.target_type === 'filtered' && (
                <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 space-y-4">
                    <h3 className="font-bold text-gray-900 mb-4">Filter Criteria</h3>

                    {/* Gender Filter */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                        <select
                            value={formData.filters.gender || ''}
                            onChange={(e) => updateFormData({ filters: { ...formData.filters, gender: e.target.value || undefined } })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                        >
                            <option value="">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Age Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Min Age</label>
                            <input
                                type="number"
                                value={formData.filters.age_min || ''}
                                onChange={(e) => updateFormData({ filters: { ...formData.filters, age_min: e.target.value ? Number(e.target.value) : undefined } })}
                                placeholder="e.g., 18"
                                min="0"
                                max="120"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Max Age</label>
                            <input
                                type="number"
                                value={formData.filters.age_max || ''}
                                onChange={(e) => updateFormData({ filters: { ...formData.filters, age_max: e.target.value ? Number(e.target.value) : undefined } })}
                                placeholder="e.g., 65"
                                min="0"
                                max="120"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Upload (if manual is selected) */}
            {formData.target_type === 'manual' && (
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                    <h3 className="font-bold text-gray-900 mb-4">Upload Patient List</h3>
                    <p className="text-sm text-gray-600 mb-4">Upload a CSV file with patient IDs or phone numbers/emails</p>
                    <input
                        type="file"
                        accept=".csv"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">CSV format: One patient per line</p>
                </div>
            )}

            {/* Recipient Count */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Estimated Recipients</p>
                        <p className="text-4xl font-bold text-gray-900">
                            {loadingCount ? '...' : recipientCount.toLocaleString()}
                        </p>
                    </div>
                    < Users className="w-16 h-16 text-blue-500 opacity-50" />
                </div>
            </div>

            <button type="submit" className="hidden">Submit</button>
        </form>
    );
}
