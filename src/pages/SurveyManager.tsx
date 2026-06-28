
import React, { useEffect, useState } from 'react';
import { surveyService } from '../services/surveyService';
import { Plus, List, BarChart2, Edit, Trash, X, Check, Star, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'scale' | 'date' | 'star';

interface Question {
    id: string;
    text: string;
    type: QuestionType;
    required: boolean;
    options?: string[]; // For radio, checkbox, select
    validation?: {
        min?: number;
        max?: number;
        pattern?: string; // Regex for text
    };
    scaleConfig?: {
        min: number;
        max: number;
        labels?: { [key: number]: string };
    };
    maxStars?: number; // For star rating
    analysis?: {
        sentiment?: { [option: string]: 'positive' | 'negative' | 'neutral' }; // For choices
        positiveThreshold?: number; // For scale/star (value > this is positive)
    };
}

interface SurveyTemplate {
    id: string;
    name: string;
    description?: string;
    category?: string;
    questions: Question[];
    created_at?: string;
    is_active?: boolean;
}

export function SurveyManager() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create' | 'results' | 'preview'>('list');
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
    const { user } = useAuthStore();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'General',
        questions: [] as Question[]
    });

    // Question Editing State
    const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    async function loadTemplates() {
        try {
            const data = await surveyService.getTemplates();
            setTemplates(data || []);
        } catch (error) {
            console.error('Failed to load surveys', error);
        } finally {
            setLoading(false);
        }
    }

    function handleSave(e: React.FormEvent) {
        e.preventDefault();

        // Prepare payload
        const payload = {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            is_active: true,
            questions: formData.questions,
            alert_rules: {},
            scoring_rules: {},
            created_by: user?.id || ''
        };

        if (editingTemplateId) {
            surveyService.updateTemplate(editingTemplateId, payload as any)
                .then(() => {
                    alert('Survey updated successfully!');
                    setView('list');
                    loadTemplates();
                    resetForm();
                })
                .catch(err => {
                    console.error(err);
                    alert('Failed to update survey');
                });
        } else {
            surveyService.createTemplate(payload as any)
                .then(() => {
                    alert('Survey created successfully!');
                    setView('list');
                    loadTemplates();
                    resetForm();
                })
                .catch(err => {
                    console.error(err);
                    alert('Failed to create survey');
                });
        }
    }

    function resetForm() {
        setFormData({ name: '', description: '', category: 'General', questions: [] });
        setEditingQuestion(null);
        setIsAddingQuestion(false);
        setEditingTemplateId(null);
    }

    const handleEdit = (template: SurveyTemplate) => {
        // Deduplicate questions by ID to prevent errors
        const uniqueQuestions: Question[] = [];
        const seenIds = new Set();

        (template.questions || []).forEach((q: any) => {
            if (!seenIds.has(q.id)) {
                seenIds.add(q.id);
                uniqueQuestions.push(q);
            } else {
                // If duplicate ID found, regenerate it
                const newId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                uniqueQuestions.push({ ...q, id: newId });
            }
        });

        setFormData({
            name: template.name,
            description: template.description || '',
            category: template.category || 'General',
            questions: uniqueQuestions
        });
        setEditingTemplateId(template.id);
        setView('create');
    };

    const loadStats = async (templateId: string) => {
        const data = await surveyService.getSurveyStats(templateId);
        setStats(data);
    };

    // Question Builder Helpers
    const startAddQuestion = () => {
        setEditingQuestion({
            id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: '',
            type: 'text',
            required: false,
            options: [],
            validation: {},
            scaleConfig: { min: 1, max: 10 },
            maxStars: 5
        });
        setIsAddingQuestion(true);
    };

    const saveQuestion = () => {
        if (!editingQuestion || !editingQuestion.text) return;

        const newQuestion = editingQuestion as Question;

        // Clean up based on type
        if (!['radio', 'checkbox', 'select'].includes(newQuestion.type)) {
            delete newQuestion.options;
        }
        if (newQuestion.type !== 'scale') {
            delete newQuestion.scaleConfig;
        }
        if (newQuestion.type !== 'star') {
            delete newQuestion.maxStars;
        }

        setFormData(prev => {
            const index = prev.questions.findIndex(q => q.id === newQuestion.id);
            if (index >= 0) {
                const updated = [...prev.questions];
                updated[index] = newQuestion;
                return { ...prev, questions: updated };
            }
            return {
                ...prev,
                questions: [...prev.questions, newQuestion]
            };
        });
        setIsAddingQuestion(false);
        setEditingQuestion(null);
    };

    const deleteQuestion = (id: string) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id)
        }));
    };

    const editQuestion = (id: string) => {
        const questionToEdit = formData.questions.find(q => q.id === id);
        if (questionToEdit) {
            setEditingQuestion({ ...questionToEdit });
            setIsAddingQuestion(true);
        }
    };

    const addOption = () => {
        if (!editingQuestion) return;
        const currentOptions = editingQuestion.options || [];
        setEditingQuestion({
            ...editingQuestion,
            options: [...currentOptions, `Option ${currentOptions.length + 1}`]
        });
    };

    const updateOption = (index: number, value: string) => {
        if (!editingQuestion || !editingQuestion.options) return;
        const newOptions = [...editingQuestion.options];
        newOptions[index] = value;
        setEditingQuestion({ ...editingQuestion, options: newOptions });
    };

    const removeOption = (index: number) => {
        if (!editingQuestion || !editingQuestion.options) return;
        const newOptions = editingQuestion.options.filter((_, i) => i !== index);
        setEditingQuestion({ ...editingQuestion, options: newOptions });
    };

    // Render Components
    const renderQuestionEditor = () => {
        if (!editingQuestion) return null;

        return (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Question Text</label>
                        <input
                            type="text"
                            value={editingQuestion.text}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            placeholder="e.g. How satisfied were you with the service?"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            value={editingQuestion.type}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as QuestionType })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        >
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="radio">Single Choice (Radio)</option>
                            <option value="checkbox">Multiple Choice (Checkbox)</option>
                            <option value="select">Dropdown</option>
                            <option value="scale">Rating Scale</option>
                            <option value="star">Star Rating</option>
                            <option value="date">Date</option>
                        </select>
                    </div>
                    <div className="flex items-center mt-6">
                        <input
                            type="checkbox"
                            checked={editingQuestion.required}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, required: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">Required</label>
                    </div>
                </div>

                {/* Type Specific Config */}
                {['radio', 'checkbox', 'select'].includes(editingQuestion.type || '') && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                        {editingQuestion.options?.map((opt, idx) => (
                            <div key={idx} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateOption(idx, e.target.value)}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
                                />
                                <button type="button" onClick={() => removeOption(idx)} className="ml-2 text-red-500 hover:text-red-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addOption} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                            <Plus className="w-3 h-3 mr-1" /> Add Option
                        </button>
                    </div>
                )}

                {/* Sentiment Config for Choices */}
                {['radio', 'checkbox', 'select'].includes(editingQuestion.type || '') && editingQuestion.options && editingQuestion.options.length > 0 && (
                    <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Answer Sentiment Analysis</label>
                        <p className="text-xs text-gray-500 mb-2">Define which answers are considered positive or negative.</p>
                        {editingQuestion.options.map((opt, idx) => (
                            <div key={idx} className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-700 truncate w-1/3" title={opt}>{opt}</span>
                                <select
                                    value={editingQuestion.analysis?.sentiment?.[opt] || 'neutral'}
                                    onChange={(e) => {
                                        const newSentiment = { ...(editingQuestion.analysis?.sentiment || {}) };
                                        newSentiment[opt] = e.target.value as any;
                                        setEditingQuestion({
                                            ...editingQuestion,
                                            analysis: { ...editingQuestion.analysis, sentiment: newSentiment }
                                        });
                                    }}
                                    className={`text-xs rounded border p-1 w-32 ${editingQuestion.analysis?.sentiment?.[opt] === 'positive' ? 'bg-green-50 text-green-700 border-green-200' :
                                        editingQuestion.analysis?.sentiment?.[opt] === 'negative' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <option value="positive">Positive (+)</option>
                                    <option value="neutral">Neutral</option>
                                    <option value="negative">Negative (-)</option>
                                </select>
                            </div>
                        ))}
                    </div>
                )}

                {editingQuestion.type === 'scale' && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Min Value</label>
                            <input
                                type="number"
                                value={editingQuestion.scaleConfig?.min || 1}
                                onChange={(e) => setEditingQuestion({
                                    ...editingQuestion,
                                    scaleConfig: { ...editingQuestion.scaleConfig!, min: parseInt(e.target.value) }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max Value</label>
                            <input
                                type="number"
                                value={editingQuestion.scaleConfig?.max || 10}
                                onChange={(e) => setEditingQuestion({
                                    ...editingQuestion,
                                    scaleConfig: { ...editingQuestion.scaleConfig!, max: parseInt(e.target.value) }
                                })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            />
                        </div>
                    </div>
                )}

                {editingQuestion.type === 'star' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Max Stars</label>
                        <select
                            value={editingQuestion.maxStars || 5}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, maxStars: parseInt(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        >
                            <option value={3}>3 Stars</option>
                            <option value={5}>5 Stars</option>
                            <option value={7}>7 Stars</option>
                            <option value={10}>10 Stars</option>
                        </select>
                    </div>
                )}

                {/* Sentiment Config for Ratings */}
                {['scale', 'star'].includes(editingQuestion.type || '') && (
                    <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sentiment Threshold</label>
                        <p className="text-xs text-gray-500 mb-2">Values greater than this are considered positive. (e.g. {'>'} 3 is Positive)</p>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">Consider Positive if value {'>'} </span>
                            <input
                                type="number"
                                value={editingQuestion.analysis?.positiveThreshold || ''}
                                onChange={(e) => setEditingQuestion({
                                    ...editingQuestion,
                                    analysis: { ...editingQuestion.analysis, positiveThreshold: parseFloat(e.target.value) }
                                })}
                                className="w-20 rounded-md border-gray-300 shadow-sm p-1 text-sm border"
                                placeholder={editingQuestion.type === 'star' ? (editingQuestion.maxStars ? (editingQuestion.maxStars / 2).toString() : "2.5") : "5"}
                            />
                        </div>
                    </div>
                )}


                {/* Validation Config */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Validations</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {['text', 'textarea'].includes(editingQuestion.type || '') && (
                            <>
                                <div>
                                    <label className="block text-xs text-gray-500">Min Length</label>
                                    <input
                                        type="number"
                                        value={editingQuestion.validation?.min || ''}
                                        onChange={(e) => setEditingQuestion({
                                            ...editingQuestion,
                                            validation: { ...editingQuestion.validation, min: parseInt(e.target.value) || undefined }
                                        })}
                                        className="mt-1 block w-full rounded p-1 border border-gray-300 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Max Length</label>
                                    <input
                                        type="number"
                                        value={editingQuestion.validation?.max || ''}
                                        onChange={(e) => setEditingQuestion({
                                            ...editingQuestion,
                                            validation: { ...editingQuestion.validation, max: parseInt(e.target.value) || undefined }
                                        })}
                                        className="mt-1 block w-full rounded p-1 border border-gray-300 text-sm"
                                    />
                                </div>
                            </>
                        )}
                        {/* More validations can be added here */}
                    </div>
                </div>

                <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                    <button type="button" onClick={() => setIsAddingQuestion(false)} className="mr-3 px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm">Cancel</button>
                    <button type="button" onClick={saveQuestion} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
                        {formData.questions.some(q => q.id === editingQuestion.id) ? 'Update Question' : 'Add Question'}
                    </button>
                </div>
            </div>
        );
    };

    if (view === 'create') {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">{editingTemplateId ? 'Edit Survey' : 'Create New Survey'}</h1>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setView('preview')} className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                            <span className="mr-2">👁️</span> Preview
                        </button>
                        <button type="button" onClick={() => { setView('list'); resetForm(); }} className="text-gray-600 hover:text-gray-900 px-4 py-2">Cancel</button>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Survey Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    placeholder="e.g. Patient Satisfaction"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                >
                                    <option>General</option>
                                    <option>Clinical</option>
                                    <option>Feedback</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    rows={2}
                                    placeholder="Brief description..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Questions ({formData.questions.length})</h3>
                                {!isAddingQuestion && (
                                    <button type="button" onClick={startAddQuestion} className="flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 border border-blue-200">
                                        <Plus className="w-4 h-4 mr-1" /> Add Question
                                    </button>
                                )}
                            </div>

                            {/* Question List */}
                            <div className="space-y-3 mb-6">
                                {formData.questions.map((q, i) => (
                                    <div key={q.id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex justify-between items-start group hover:border-blue-300 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-1">
                                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded mr-2">Q{i + 1}</span>
                                                <span className="font-medium text-gray-900">{q.text}</span>
                                                {q.required && <span className="ml-2 text-red-500 text-xs">*Required</span>}
                                            </div>
                                            <div className="text-sm text-gray-500 ml-8">
                                                <span className="uppercase text-xs font-semibold tracking-wider">{q.type}</span>
                                                {['radio', 'checkbox', 'select'].includes(q.type) && (
                                                    <span className="ml-2">• {q.options?.length} Options</span>
                                                )}
                                            </div>

                                        </div>
                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" onClick={() => editQuestion(q.id)} className="text-gray-400 hover:text-blue-600 mr-2">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => deleteQuestion(q.id)} className="text-gray-400 hover:text-red-600">
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {formData.questions.length === 0 && !isAddingQuestion && (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        No questions added yet. Click "Add Question" to start.
                                    </div>
                                )}
                            </div>

                            {/* Editor */}
                            {isAddingQuestion && renderQuestionEditor()}
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm">
                                {editingTemplateId ? 'Update Survey' : 'Save Complete Survey'}
                            </button>
                        </div>
                    </form>
                </div >
            </div >
        );
    }

    // Results View - Keeping mostly the same but ensuring types
    if (view === 'preview') {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Preview: {formData.name || 'Untitled Survey'}</h1>
                        <p className="text-gray-500">This is how the survey will look to patients.</p>
                    </div>
                    <button onClick={() => setView('create')} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Back to Editor
                    </button>
                </div>

                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-blue-600 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">{formData.name || 'Survey Title'}</h2>
                        <p className="opacity-90">{formData.description || 'Survey Description'}</p>
                    </div>
                    <div className="p-8 space-y-8">
                        {formData.questions.map((q, i) => (
                            <div key={q.id} className="animate-fadeIn">
                                <label className="block text-gray-800 font-medium mb-3 text-lg">
                                    <span className="text-blue-600 font-bold mr-2">{i + 1}.</span>
                                    {q.text}
                                    {q.required && <span className="text-red-500 ml-1">*</span>}
                                </label>

                                {q.type === 'text' && (
                                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors" placeholder="Your answer..." />
                                )}

                                {q.type === 'textarea' && (
                                    <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors h-32" placeholder="Your answer..."></textarea>
                                )}

                                {q.type === 'radio' && (
                                    <div className="space-y-3">
                                        {q.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group">
                                                <input type="radio" name={q.id} className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                                <span className="ml-3 text-gray-700 group-hover:text-gray-900">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'checkbox' && (
                                    <div className="space-y-3">
                                        {q.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group">
                                                <input type="checkbox" className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                                <span className="ml-3 text-gray-700 group-hover:text-gray-900">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'select' && (
                                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                                        <option value="">Select an option...</option>
                                        {q.options?.map((opt, idx) => (
                                            <option key={idx} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                )}

                                {q.type === 'scale' && q.scaleConfig && (
                                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-500 font-medium">{q.scaleConfig.min}</span>
                                        <div className="flex gap-2 w-full mx-4 justify-between">
                                            {Array.from({ length: q.scaleConfig.max - q.scaleConfig.min + 1 }, (_, idx) => q.scaleConfig!.min + idx).map(val => (
                                                <label key={val} className="flex flex-col items-center cursor-pointer group">
                                                    <input type="radio" name={q.id} className="sr-only peer" />
                                                    <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white transition-all font-bold text-gray-600 group-hover:border-blue-400">
                                                        {val}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <span className="text-gray-500 font-medium">{q.scaleConfig.max}</span>
                                    </div>
                                )}

                                {q.type === 'star' && (
                                    <div className="flex gap-2">
                                        {Array.from({ length: q.maxStars || 5 }).map((_, idx) => (
                                            <button key={idx} type="button" className="text-gray-300 hover:text-yellow-400 focus:outline-none transition-colors">
                                                <Star className="w-8 h-8 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'date' && (
                                    <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors" />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-gray-50 border-t border-gray-200 text-center">
                        <button disabled className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium opacity-50 cursor-not-allowed">Submit Survey (Preview)</button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'results' && selectedTemplate) {
        if (!stats) loadStats(selectedTemplate.id);

        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Results: {selectedTemplate.name}</h1>
                        <p className="text-gray-500">Analytics Overview</p>
                    </div>
                    <button onClick={() => { setView('list'); setStats(null); }} className="text-gray-600 hover:text-gray-900">Back to List</button>
                </div>

                {stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Total Sent</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.sent}</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Completed</div>
                            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Completion Rate</div>
                            <div className="text-3xl font-bold text-blue-600">{stats.completionRate}%</div>
                        </div>
                    </div>
                ) : (
                    <div>Loading stats...</div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-center p-12 text-gray-500">
                        <BarChart2 className="w-12 h-12 mb-4" />
                        <span className="ml-4 text-lg">Detailed question analysis pending data...</span>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Management</h1>
                    <p className="text-gray-500">Create and manage patient satisfaction surveys</p>
                </div>
                <button
                    onClick={() => { resetForm(); setView('create'); }}
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-md font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Survey
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                    <p className="mt-4 text-gray-500 text-sm">Loading surveys...</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {templates.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <List className="w-10 h-10 text-indigo-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No surveys found</p>
                            <p className="text-gray-400 text-sm mt-1">Create one to get started</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                            </svg>
                                            Survey Name
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            Category
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            Questions
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Status
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-indigo-50/50 transition-all duration-200 group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-indigo-100 group-hover:ring-indigo-200 transition-all">
                                                    {template.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{template.name}</div>
                                                    {template.description && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">{template.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                                {template.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-gray-900">{(template.questions as any[])?.length || 0}</span>
                                                <span className="text-sm text-gray-500">questions</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2 ${template.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                                                {template.is_active ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedTemplate(template); setView('results'); setStats(null); }}
                                                    className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200 group/btn"
                                                    title="View Results"
                                                >
                                                    <BarChart2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(template)}
                                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 group/btn"
                                                    title="Edit Survey"
                                                >
                                                    <Edit className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                                </button>
                                                <button
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group/btn"
                                                    title="Delete Survey"
                                                >
                                                    <Trash className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
