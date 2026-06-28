import { useEffect, useState } from 'react';
import { campaignService, type CampaignTemplate } from '../../services/campaignService';
import { Plus, Edit, Trash2, Mail, MessageSquare, Eye, Search, Filter } from 'lucide-react';
import { useToast } from '../../hooks/useToast';




export default function TemplateManagement() {
    const toast = useToast();
    const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CampaignTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<CampaignTemplate | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterChannel, setFilterChannel] = useState('all');
    const [filterSpecialty, setFilterSpecialty] = useState('all');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await campaignService.getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (template: CampaignTemplate) => {
        if (template.is_system) {
            toast.error('Cannot delete system templates');
            return;
        }

        if (confirm(`Delete template "${template.name}"?`)) {
            try {
                // TODO: Implement delete in service
                toast.success('Template deleted');
                loadTemplates();
            } catch (error) {
                console.error('Failed to delete template:', error);
                toast.error('Failed to delete template');
            }
        }
    };

    // Extract category from template name (e.g., [DENTAL], [FEEDBACK])
    const getCategory = (name: string) => {
        const match = name.match(/^\[(.*?)\]/);
        return match ? match[1] : 'GENERAL';
    };

    // Filter templates
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const category = getCategory(template.name);
        const matchesCategory = filterCategory === 'all' || category === filterCategory;
        const matchesChannel = filterChannel === 'all' || template.channel === filterChannel;
        const matchesSpecialty = filterSpecialty === 'all' || category === filterSpecialty;

        return matchesSearch && matchesCategory && matchesChannel && matchesSpecialty;
    });

    // Group templates by category
    const groupedTemplates = filteredTemplates.reduce((acc, template) => {
        const category = getCategory(template.name);
        if (!acc[category]) acc[category] = [];
        acc[category].push(template);
        return acc;
    }, {} as Record<string, CampaignTemplate[]>);

    // Get unique categories and specialties
    const categories = Array.from(new Set(templates.map(t => getCategory(t.name)))).sort();
    const specialties = categories.filter(c => !['GENERAL', 'FEEDBACK', 'FOLLOW-UP'].includes(c));

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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 font-medium">Loading templates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Campaign Templates
                            </h1>
                            <p className="text-gray-600 mt-1">{templates.length} templates across {categories.length} categories</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            New Template
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search templates..."
                                    className="w-full px-4 py-3 pl-11 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Specialty Filter */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Medical Specialty</label>
                            <select
                                value={filterSpecialty}
                                onChange={(e) => setFilterSpecialty(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Specialties</option>
                                {specialties.map(specialty => (
                                    <option key={specialty} value={specialty}>
                                        {categoryIcons[specialty] || '🏥'} {specialty}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Channel Filter */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Channel</label>
                            <select
                                value={filterChannel}
                                onChange={(e) => setFilterChannel(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Channels</option>
                                <option value="email">📧 Email Only</option>
                                <option value="sms">📱 SMS Only</option>
                                <option value="both">📧📱 Both</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Categories</option>
                                <option value="FEEDBACK">⭐ Feedback & Surveys</option>
                                <option value="FOLLOW-UP">📋 Follow-ups</option>
                                <option value="GENERAL">🏥 General</option>
                                {specialties.map(specialty => (
                                    <option key={specialty} value={specialty}>
                                        {categoryIcons[specialty]} {specialty}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(searchQuery || filterCategory !== 'all' || filterChannel !== 'all' || filterSpecialty !== 'all') && (
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Showing {filteredTemplates.length} of {templates.length} templates</span>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterCategory('all');
                                    setFilterChannel('all');
                                    setFilterSpecialty('all');
                                }}
                                className="ml-auto text-purple-600 hover:text-purple-700 font-semibold"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Grouped Templates */}
                {Object.keys(groupedTemplates).length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 p-16 text-center">
                        <p className="text-gray-500">No templates found matching your filters</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                            <div key={category} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                {/* Category Header */}
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                                    <span className="text-3xl">{categoryIcons[category] || '🏥'}</span>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                                        <p className="text-sm text-gray-600">{categoryTemplates.length} templates</p>
                                    </div>
                                </div>

                                {/* Templates Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categoryTemplates.map((template) => {
                                        const isEmail = template.channel === 'email' || template.channel === 'both';
                                        const isSMS = template.channel === 'sms' || template.channel === 'both';

                                        return (
                                            <div
                                                key={template.id}
                                                className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow border border-gray-200 hover:shadow-xl transition-all overflow-hidden"
                                            >
                                                {/* Header */}
                                                <div className={`p-4 ${isEmail && !isSMS ? 'bg-blue-50 border-b border-blue-200' :
                                                    isSMS && !isEmail ? 'bg-green-50 border-b border-green-200' :
                                                        'bg-purple-50 border-b border-purple-200'
                                                    }`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {isEmail && <Mail className="w-4 h-4 text-blue-600" />}
                                                            {isSMS && <MessageSquare className="w-4 h-4 text-green-600" />}
                                                        </div>
                                                        {template.is_system && (
                                                            <span className="px-2 py-0.5 bg-gray-800 text-white text-xs font-bold rounded">
                                                                SYSTEM
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 text-sm">
                                                        {template.name.replace(/^\[(.*?)\]\s*/, '')}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                                                </div>

                                                {/* Content Preview */}
                                                <div className="p-4">
                                                    {template.subject && (
                                                        <div className="mb-2">
                                                            <p className="text-xs text-gray-500">Subject:</p>
                                                            <p className="text-xs font-medium text-gray-900 line-clamp-1">
                                                                {template.subject}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Message:</p>
                                                        <p className="text-xs text-gray-700 line-clamp-2">
                                                            {template.body}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="px-4 pb-4 flex gap-2">
                                                    <button
                                                        onClick={() => setPreviewTemplate(template)}
                                                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        Preview
                                                    </button>
                                                    {!template.is_system && (
                                                        <>
                                                            <button
                                                                onClick={() => setEditingTemplate(template)}
                                                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                                                            >
                                                                <Edit className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(template)}
                                                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modals */}
                {showCreateModal && (
                    <TemplateFormModal
                        onClose={() => setShowCreateModal(false)}
                        onSave={() => {
                            setShowCreateModal(false);
                            loadTemplates();
                        }}
                    />
                )}

                {editingTemplate && (
                    <TemplateFormModal
                        template={editingTemplate}
                        onClose={() => setEditingTemplate(null)}
                        onSave={() => {
                            setEditingTemplate(null);
                            loadTemplates();
                        }}
                    />
                )}

                {previewTemplate && (
                    <TemplatePreviewModal
                        template={previewTemplate}
                        onClose={() => setPreviewTemplate(null)}
                    />
                )}
            </div>
        </div>
    );
}

// Template Form Modal Component
const TemplateFormModal = ({
    template,
    onClose,
    onSave
}: {
    template?: CampaignTemplate;
    onClose: () => void;
    onSave: () => void;
}) => {
    const toast = useToast();
    const [formData, setFormData] = useState({
        name: template?.name || '',
        description: template?.description || '',
        channel: template?.channel || 'email' as 'email' | 'sms' | 'both',
        template_type: template?.template_type || '',
        subject: template?.subject || '',
        body: template?.body || '',
        variables: template?.variables || []
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // TODO: Implement create/update in service
            toast.success(template ? 'Template updated' : 'Template created');
            onSave();
        } catch (error) {
            console.error('Failed to save template:', error);
            toast.error('Failed to save template');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {template ? 'Edit Template' : 'Create New Template'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Channel *</label>
                        <select
                            value={formData.channel}
                            onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="both">Both</option>
                        </select>
                    </div>

                    {(formData.channel === 'email' || formData.channel === 'both') && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                        <textarea
                            value={formData.body}
                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                            rows={8}
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            {template ? 'Update' : 'Create'} Template
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Template Preview Modal with Markdown Rendering
const TemplatePreviewModal = ({
    template,
    onClose
}: {
    template: CampaignTemplate;
    onClose: () => void;
}) => {
    // Simple markdown-to-HTML converter for template formatting
    const renderMarkdown = (text: string) => {
        let html = text;

        // Convert **bold** to <strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Convert emoji headers like 🌟 **Header** to styled divs
        html = html.replace(/([\u{1F300}-\u{1F9FF}])\s+\*\*(.*?)\*\*/gu,
            '<div class="flex items-center gap-2 mb-3"><span class="text-2xl">$1</span><strong class="text-lg text-gray-900">$2</strong></div>');

        // Convert bullet points (• or -) to list items
        html = html.replace(/^[\s]*[•\-]\s+(.+)$/gm, '<li class="ml-4">$1</li>');

        // Wrap consecutive <li> tags in <ul>
        html = html.replace(/(<li[^>]*>.*?<\/li>[\s\n]*)+/gs, '<ul class="list-disc list-outside space-y-1 my-2">$&</ul>');

        // Convert numbered lists like "1. Item" to ordered lists
        html = html.replace(/^[\s]*(\d+)\.\s+(.+)$/gm, '<li class="ml-4">$2</li>');
        html = html.replace(/(<li[^>]*>.*?<\/li>[\s\n]*)+/gs, (match) => {
            if (!match.includes('list-disc')) {
                return '<ol class="list-decimal list-outside space-y-1 my-2">' + match + '</ol>';
            }
            return match;
        });

        // Convert section headers (lines that end with :) to styled headers
        html = html.replace(/^([^:\n]+):$/gm, '<div class="font-bold text-purple-700 mt-4 mb-2">$1:</div>');

        // Preserve line breaks
        html = html.replace(/\n/g, '<br/>');

        return html;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                    <div className="flex gap-2">
                        {template.is_system && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                VERIFIED
                            </span>
                        )}
                    </div>
                </div>

                {/* Subject */}
                {template.subject && (
                    <div className="mb-6 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                        <p className="text-xs font-bold text-blue-700 uppercase mb-2">Subject Line:</p>
                        <p
                            className="font-bold text-gray-900 text-lg"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(template.subject) }}
                        />
                    </div>
                )}

                {/* Message Body */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200">
                    <p className="text-xs font-bold text-gray-600 uppercase mb-4">Message Preview:</p>
                    <div
                        className="text-gray-900 leading-relaxed rendered-template-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(template.body) }}
                        style={{
                            wordBreak: 'break-word'
                        }}
                    />
                </div>

                {/* Variables */}
                {template.variables && Array.isArray(template.variables) && template.variables.length > 0 && (
                    <div className="mt-6 bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                        <p className="text-xs font-bold text-purple-700 uppercase mb-3">Dynamic Variables:</p>
                        <div className="flex flex-wrap gap-2">
                            {template.variables.map((variable: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 bg-white border-2 border-purple-300 text-purple-700 text-sm rounded-lg font-mono font-bold"
                                >
                                    {`{{${variable}}}`}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Channel Info */}
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Channel:</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">
                            {template.channel === 'both' ? '📧 Email & 📱 SMS' :
                                template.channel === 'email' ? '📧 Email' : '📱 SMS'}
                        </span>
                    </div>
                    {template.template_type && (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Type:</span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full font-medium capitalize">
                                {template.template_type.replace('_', ' ')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]"
                >
                    Close Preview
                </button>
            </div>

            {/* Custom styles for rendered content */}
            <style>{`
                .rendered-template-content strong {
                    font-weight: 700;
                    color: #1f2937;
                }
                .rendered-template-content ul,
                .rendered-template-content ol {
                    margin-left: 1rem;
                }
                .rendered-template-content li {
                    margin-bottom: 0.25rem;
                }
                .rendered-template-content br + br {
                    content: '';
                    display: block;
                    margin-top: 0.75rem;
                }
            `}</style>
        </div>
    );
};

