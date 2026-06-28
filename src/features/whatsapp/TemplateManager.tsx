import { useState, useEffect } from 'react';
import { whatsappService, type WhatsAppTemplate } from '../../services/whatsappService';
import { Plus, Edit, Trash2, CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';

export default function WhatsAppTemplateManager() {
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'utility',
        template_id: '',
        content: '',
        variables: [] as string[],
        status: 'pending'
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await whatsappService.getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingTemplate(null);
        setFormData({
            name: '',
            category: 'utility',
            template_id: '',
            content: '',
            variables: [],
            status: 'pending'
        });
        setShowCreateForm(true);
    };

    const handleEdit = (template: WhatsAppTemplate) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            category: template.category,
            template_id: template.template_id,
            content: template.content,
            variables: template.variables || [],
            status: template.status
        });
        setShowCreateForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTemplate) {
                // Update existing template (would need update method in service)
                console.log('Update template:', formData);
            } else {
                // Create new template
                await whatsappService.createTemplate(formData);
            }
            setShowCreateForm(false);
            loadTemplates();
        } catch (error) {
            console.error('Failed to save template:', error);
            alert('Failed to save template');
        }
    };

    const handleDelete = async (templateId: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            // Would need delete method in service
            console.log('Delete template:', templateId);
            loadTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
        }
    };

    const extractVariables = (content: string): string[] => {
        const matches = content.match(/\{\{(\d+)\}\}/g);
        if (!matches) return [];

        const count = Math.max(...matches.map(m => parseInt(m.match(/\d+/)?.[0] || '0')));
        return Array.from({ length: count }, (_, i) => `variable_${i + 1}`);
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({
            ...prev,
            content,
            variables: extractVariables(content)
        }));
    };

    const statusConfig = {
        approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: <CheckCircle className="w-4 h-4" /> },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: <Clock className="w-4 h-4" /> },
        rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: <XCircle className="w-4 h-4" /> }
    };

    const categoryConfig = {
        marketing: { color: 'text-purple-700', bg: 'bg-purple-100' },
        utility: { color: 'text-blue-700', bg: 'bg-blue-100' },
        authentication: { color: 'text-green-700', bg: 'bg-green-100' }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <MessageSquare className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    WhatsApp Templates
                                </h1>
                                <p className="text-gray-600 mt-1">Manage pre-approved message templates</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            New Template
                        </button>
                    </div>
                </div>

                {/* Templates Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-600"></div>
                    </div>
                ) : templates.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-green-200 p-16 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No templates found</h3>
                        <p className="text-gray-500 mb-6">Create your first WhatsApp message template</p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold"
                        >
                            <Plus className="w-5 h-5 inline mr-2" />
                            Create Template
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Template Name
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase tracking-wider">
                                        Variables
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-green-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {templates.map((template) => {
                                    const status = statusConfig[template.status as keyof typeof statusConfig] || statusConfig.pending;
                                    const category = categoryConfig[template.category as keyof typeof categoryConfig] || categoryConfig.utility;

                                    return (
                                        <tr key={template.id} className="hover:bg-green-50/50 transition-all duration-200 group">
                                            <td className="px-6 py-5">
                                                <div>
                                                    <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                                                        {template.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 line-clamp-2 max-w-md mt-1">
                                                        {template.content}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${category.bg} ${category.color}`}>
                                                    {template.category.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${status.bg} ${status.text} ${status.border}`}>
                                                    {status.icon}
                                                    {template.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-wrap gap-1">
                                                    {template.variables?.slice(0, 3).map((variable: string, i: number) => (
                                                        <span key={i} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                                                            {'{{'}{i + 1}{'}}'} {variable}
                                                        </span>
                                                    ))}
                                                    {template.variables && template.variables.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            +{template.variables.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(template)}
                                                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                                                        title="Edit Template"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(template.id)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                        title="Delete Template"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Info Card */}
                <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        About WhatsApp Templates
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Templates must be approved by WhatsApp before use</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Use variables like {'{'}1{'}'}, {'{'}2{'}'} for personalization</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Approved templates can be used in campaigns and workflows</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Template approval typically takes 24-48 hours</span>
                        </li>
                    </ul>
                </div>

                {/* Create/Edit Template Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
                                <h2 className="text-2xl font-bold">
                                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Template Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Template Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="e.g., Appointment Reminder"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="utility">Utility</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="authentication">Authentication</option>
                                    </select>
                                </div>

                                {/* Template ID */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Template ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.template_id}
                                        onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="e.g., appointment_reminder_1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Unique identifier for this template</p>
                                </div>

                                {/* Message Content */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message Content *
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => handleContentChange(e.target.value)}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                                        placeholder="Hello {{1}}, your appointment with Dr. {{2}} is on {{3}} at {{4}}."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Use {'{'}1{'}'}, {'{'}2{'}'}, etc. for variables. Detected: {formData.variables.length} variable(s)
                                    </p>
                                </div>

                                {/* Variables */}
                                {formData.variables.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Variables ({formData.variables.length})
                                        </label>
                                        <div className="space-y-2">
                                            {formData.variables.map((varName, index) => (
                                                <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                                    <span className="font-mono text-sm text-gray-600">
                                                        {'{'}{'{'}{index + 1}{'}'}{'}'} →
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={varName}
                                                        onChange={(e) => {
                                                            const newVars = [...formData.variables];
                                                            newVars[index] = e.target.value;
                                                            setFormData({ ...formData, variables: newVars });
                                                        }}
                                                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder={`variable_${index + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                    >
                                        {editingTemplate ? 'Update Template' : 'Create Template'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
