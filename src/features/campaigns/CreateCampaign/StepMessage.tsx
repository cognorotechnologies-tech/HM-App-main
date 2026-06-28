import { useState, useEffect } from 'react';
import { campaignService, type CampaignTemplate } from '../../../services/campaignService';
import { Search, X } from 'lucide-react';
import type { CampaignFormData } from './index';




interface Props {
    formData: CampaignFormData;
    updateFormData: (data: Partial<CampaignFormData>) => void;
    onNext: () => void;
}

export default function StepMessage({ formData, updateFormData, onNext }: Props) {
    const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        loadTemplates();
    }, [formData.channel]);

    const loadTemplates = async () => {
        try {
            setLoadingTemplates(true);
            const data = await campaignService.getTemplates(formData.channel);
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleTemplateSelect = async (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = templates.find(t => t.id === templateId);
        if (template) {
            updateFormData({
                subject: template.subject || '',
                message: template.body,
                template_id: templateId
            });
        }
    };

    const clearTemplate = () => {
        setSelectedTemplate(null);
        updateFormData({
            subject: '',
            message: '',
            template_id: undefined
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.message && (formData.channel === 'sms' || formData.subject)) {
            onNext();
        }
    };

    // Extract category from template name
    const getCategory = (name: string) => {
        const match = name.match(/^\[(.*?)\]/);
        return match ? match[1] : 'GENERAL';
    };

    // Filter templates
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const category = getCategory(template.name);
        const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories
    const categories = Array.from(new Set(templates.map(t => getCategory(t.name)))).sort();

    const categoryIcons: Record<string, string> = {
        'DENTAL': '🦷',
        'EYE': '👁️',
        'CARDIO': '❤️',
        'DERM': '🫧',
        'PEDIATRICS': '👶',
        'ORTHO': '🦴',
        'GYNEC': '👩‍⚕️',
        'FEEDBACK': '⭐',
        'FOLLOW-UP': '📋',
        'GENERAL': '🏥'
    };

    const showSubjectField = formData.channel === 'email' || formData.channel === 'both';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Campaign Message</h2>

            {/* Template Selector */}
            {!loadingTemplates && templates.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-bold text-gray-900">
                            Choose Template (Optional)
                        </label>
                        {selectedTemplate && (
                            <button
                                type="button"
                                onClick={clearTemplate}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-all flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Search and Filter */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search templates..."
                                className="w-full px-4 py-2 pl-10 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                        >
                            <option value="all">All Categories ({templates.length})</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {categoryIcons[category] || '🏥'} {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Templates Grid with Scroll */}
                    <div className="max-h-96 overflow-y-auto bg-white rounded-xl border-2 border-purple-200 p-4">
                        {filteredTemplates.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No templates found</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredTemplates.map(template => {
                                    const category = getCategory(template.name);
                                    return (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => handleTemplateSelect(template.id)}
                                            className={`p-3 rounded-lg border-2 text-left transition-all ${selectedTemplate === template.id
                                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                                : 'border-gray-300 hover:border-purple-300 hover:bg-purple-25'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                <span className="text-lg flex-shrink-0">{categoryIcons[category] || '🏥'}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm line-clamp-1">
                                                        {template.name.replace(/^\[(.*?)\]\s*/, '')}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                                        {template.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                                                    {category}
                                                </span>
                                                {template.is_system && (
                                                    <span className="text-xs px-2 py-0.5 bg-green-100 rounded text-green-700 font-bold">
                                                        VERIFIED
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-gray-600 mt-2">
                        Showing {filteredTemplates.length} of {templates.length} templates
                    </p>
                </div>
            )}

            {/* Subject (for email) */}
            {showSubjectField && (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => updateFormData({ subject: e.target.value })}
                        placeholder="Enter email subject..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                        required={showSubjectField}
                    />
                </div>
            )}

            {/* Message Body */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={formData.message}
                    onChange={(e) => updateFormData({ message: e.target.value })}
                    placeholder="Type your message here...

You can use variables like:
{{patient_name}} - Patient's name
{{doctor_name}} - Doctor's name
{{appointment_date}} - Appointment date
{{appointment_time}} - Appointment time"
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                    required
                />
                <p className="text-sm text-gray-600 mt-2">
                    {formData.message.length} characters
                    {formData.channel === 'sms' && formData.message.length > 160 && (
                        <span className="text-orange-600 font-semibold ml-2">
                            (Multiple SMS: ~{Math.ceil(formData.message.length / 160)} messages)
                        </span>
                    )}
                </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Preview</h3>
                {showSubjectField && formData.subject && (
                    <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">Subject:</p>
                        <p className="font-bold text-gray-900">{formData.subject}</p>
                    </div>
                )}
                <div>
                    <p className="text-xs text-gray-600 mb-1">Message:</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{formData.message || 'Your message will appear here...'}</p>
                </div>
            </div>

            <button type="submit" className="hidden">Submit</button>
        </form>
    );
}
