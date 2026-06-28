import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, MessageSquare, Clock, CheckSquare } from 'lucide-react';
import { surveyService } from '../../services/surveyService';
import { FormInput, FormSelect, FormTextarea, FormButton } from '../../components/forms';

const stepSchema = z.object({
    step_name: z.string().min(3, 'Step name is required'),
    step_type: z.enum(['send_message', 'send_survey', 'delay', 'condition', 'create_task']),
    delay_days: z.number().min(0).optional(),
    action_config: z.any().optional(),
});

type StepSchema = z.infer<typeof stepSchema>;

interface StepEditorProps {
    onClose: () => void;
    onSave: (stepData: any) => void;
    initialData?: any;
    stepOrder: number;
}

export default function StepEditor({ onClose, onSave, initialData, stepOrder }: StepEditorProps) {
    const [surveyTemplates, setSurveyTemplates] = useState<any[]>([]);

    const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<StepSchema>({
        resolver: zodResolver(stepSchema),
        defaultValues: {
            step_type: 'send_message',
            delay_days: 0,
            action_config: {}
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                step_name: initialData.step_name,
                step_type: initialData.step_type as any,
                delay_days: initialData.delay_days || 0,
                action_config: initialData.action_config || {}
            });
        } else {
            reset({
                step_name: '',
                step_type: 'send_message',
                delay_days: 0,
                action_config: {}
            });
        }
    }, [initialData, reset]);

    const stepType = watch('step_type');
    const actionConfig = watch('action_config');

    useEffect(() => {
        if (stepType === 'send_survey') {
            loadSurveyTemplates();
        }
    }, [stepType]);

    const loadSurveyTemplates = async () => {
        try {
            const templates = await surveyService.getTemplates();
            setSurveyTemplates(templates || []);
        } catch (error) {
            console.error('Error loading survey templates:', error);
        }
    };

    const onSubmit = (data: StepSchema) => {
        onSave({
            ...data,
            step_order: stepOrder,
            action_config: formatActionConfig(data)
        });
    };

    const formatActionConfig = (data: StepSchema) => {
        return data.action_config || {};
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {initialData ? 'Edit Workflow Step' : 'Add New Step'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure step details and actions
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Controller
                            name="step_name"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    label="Step Name"
                                    placeholder="e.g. Initial Welcome Message"
                                    name="step_name"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.step_name?.message}
                                    icon={<MessageSquare className="w-4 h-4" />}
                                />
                            )}
                        />

                        <Controller
                            name="step_type"
                            control={control}
                            render={({ field }) => (
                                <FormSelect
                                    label="Step Type"
                                    name="step_type"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.step_type?.message}
                                    options={[
                                        { value: 'send_message', label: 'Send Message (Email/SMS)' },
                                        { value: 'send_survey', label: 'Send Survey' },
                                        { value: 'create_task', label: 'Create Staff Task' },
                                        { value: 'delay', label: 'Wait / Delay' }
                                    ]}
                                />
                            )}
                        />
                    </div>

                    {/* Step Type Specific Configuration */}
                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200/60">
                        {stepType === 'delay' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <Controller
                                    name="delay_days"
                                    control={control}
                                    render={({ field }) => (
                                        <FormInput
                                            label="Wait Duration (Days)"
                                            type="number"
                                            placeholder="e.g. 3"
                                            name="delay_days"
                                            value={String(field.value)}
                                            onChange={(val) => field.onChange(Number(val))}
                                            icon={<Clock className="w-4 h-4" />}
                                        />
                                    )}
                                />
                                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    The workflow will pause for this duration before proceeding.
                                </p>
                            </div>
                        )}

                        {stepType === 'send_survey' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <FormSelect
                                    label="Select Survey Template"
                                    name="survey_template_id"
                                    value={actionConfig?.survey_template_id || ''}
                                    onChange={(val) => setValue('action_config.survey_template_id', val)}
                                    options={[
                                        { value: '', label: 'Select a survey...' },
                                        ...surveyTemplates.map(t => ({ value: t.id, label: t.name }))
                                    ]}
                                />
                                <FormSelect
                                    label="Delivery Channel"
                                    name="channel"
                                    value={actionConfig?.channel || 'email'}
                                    onChange={(val) => setValue('action_config.channel', val)}
                                    options={[
                                        { value: 'email', label: 'Email' },
                                        { value: 'sms', label: 'SMS' },
                                        { value: 'both', label: 'Both' }
                                    ]}
                                />
                            </div>
                        )}

                        {stepType === 'send_message' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <FormInput
                                    label="Message Subject (Email only)"
                                    placeholder="e.g. Welcome to Our Clinic"
                                    name="subject"
                                    value={actionConfig?.subject || ''}
                                    onChange={(val) => setValue('action_config.subject', val)}
                                />
                                <div>
                                    <FormTextarea
                                        label="Message Content"
                                        name="message"
                                        rows={5}
                                        value={actionConfig?.message || ''}
                                        onChange={(val) => setValue('action_config.message', val)}
                                        placeholder="Hello {{patient_name}}, this is a reminder regarding..."
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Supported variables: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">{'{{patient_name}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">{'{{hospital_name}}'}</code>
                                    </p>
                                </div>
                            </div>
                        )}

                        {stepType === 'create_task' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <FormInput
                                    label="Task Title"
                                    placeholder="e.g. Call patient for follow-up"
                                    name="task_title"
                                    value={actionConfig?.task_title || ''}
                                    onChange={(val) => setValue('action_config.task_title', val)}
                                    icon={<CheckSquare className="w-4 h-4" />}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormSelect
                                        label="Priority"
                                        name="priority"
                                        value={actionConfig?.priority || 'medium'}
                                        onChange={(val) => setValue('action_config.priority', val)}
                                        options={[
                                            { value: 'low', label: 'Low' },
                                            { value: 'medium', label: 'Medium' },
                                            { value: 'high', label: 'High' },
                                            { value: 'critical', label: 'Critical' }
                                        ]}
                                    />
                                    <FormSelect
                                        label="Assign Role"
                                        name="assigned_role"
                                        value={actionConfig?.assigned_role || 'nurse'}
                                        onChange={(val) => setValue('action_config.assigned_role', val)}
                                        options={[
                                            { value: 'nurse', label: 'Nurse' },
                                            { value: 'doctor', label: 'Doctor' },
                                            { value: 'admin', label: 'Admin' },
                                            { value: 'receptionist', label: 'Receptionist' }
                                        ]}
                                    />
                                </div>
                                <FormTextarea
                                    label="Task Description (Optional)"
                                    name="task_description"
                                    placeholder="e.g. Check incision site and ask about pain levels..."
                                    value={actionConfig?.task_description || ''}
                                    onChange={(val) => setValue('action_config.task_description', val)}
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                        <FormButton variant="outline" onClick={onClose}>
                            Cancel
                        </FormButton>
                        <FormButton
                            type="submit"
                            loading={isSubmitting}
                            className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-md hover:shadow-lg"
                        >
                            {initialData ? 'Save Changes' : 'Add Step'}
                        </FormButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

