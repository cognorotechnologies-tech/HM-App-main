
import { X, Save, Trash2, Plus, Variable, Search } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { FormInput, FormSelect, FormTextarea, FormButton } from '../../../components/forms';

const variableOptions = [
    { label: 'Patient Name', value: '{{patient.first_name}}' },
    { label: 'Patient Phone', value: '{{patient.phone}}' },
    { label: 'Doctor Name', value: '{{doctor.name}}' },
    { label: 'Appointment Date', value: '{{appointment.date}}' },
    { label: 'Clinic Name', value: '{{clinic.name}}' },
];

const stepSchema = z.object({
    step_name: z.string().min(3, 'Step name is required'),
    description: z.string().optional(),
    delay_days: z.number().min(0).optional(),
    condition: z.string().optional(),
    action_config: z.any().optional()
});

type StepSchema = z.infer<typeof stepSchema>;

interface ConfigPanelProps {
    nodeId: string;
    data: any;
    nodeType: string;
    onClose: () => void;
    onSave: (id: string, data: any) => void;
    onDelete: (id: string) => void;
}

export default function ConfigPanel({ nodeId, data, nodeType, onClose, onSave, onDelete }: ConfigPanelProps) {
    const [showVariables, setShowVariables] = useState(false);
    const { control, handleSubmit, watch, reset, setValue, getValues, formState: { errors } } = useForm<StepSchema>({
        resolver: zodResolver(stepSchema),
        defaultValues: {
            step_name: '',
            description: '',
            delay_days: 0,
            condition: '',
            action_config: {}
        }
    });

    const actionConfig = watch('action_config');

    useEffect(() => {
        if (data) {
            reset({
                step_name: data.label || '',
                description: data.description || '',
                delay_days: data.delay_days || 0,
                condition: data.condition || '',
                action_config: data.action_config || {
                    channel: data.channel || 'email',
                    message: data.message || '',
                    subject: data.subject || '',
                    delay_type: 'fixed',
                    duration_value: data.delay_days || 0
                }
            });
        }
    }, [data, nodeId, reset]);

    const onSubmit = (formData: StepSchema) => {
        onSave(nodeId, {
            ...data,
            label: formData.step_name,
            step_name: formData.step_name,
            description: formData.description,
            delay_days: formData.delay_days,
            condition: formData.condition,
            action_config: formData.action_config
        });
    };

    const insertVariable = (variable: string) => {
        const currentMsg = getValues('action_config.message') || '';
        setValue('action_config.message', currentMsg + ' ' + variable);
        setShowVariables(false);
    };

    return (
        <div className="h-full bg-white border-l border-gray-200 flex flex-col shadow-xl animate-in slide-in-from-right duration-300 w-full relative group">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h3 className="font-bold text-gray-900">
                        {nodeType === 'communication' ? 'Message Configuration' :
                            nodeType === 'logic' ? 'Condition Logic' :
                                nodeType === 'delay' ? 'Delay Settings' : 'Step Configuration'}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">{nodeId.slice(0, 8)}</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <form id="config-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Controller
                        name="step_name"
                        control={control}
                        render={({ field }) => (
                            <FormInput
                                label="Step Name"
                                placeholder="e.g. Welcome Email"
                                {...field}
                                value={field.value ?? ''}
                                error={errors.step_name?.message}
                            />
                        )}
                    />

                    {nodeType === 'delay' && (
                        <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 space-y-4">
                            <FormSelect
                                label="Delay Type"
                                name="action_config.delay_type"
                                value={actionConfig?.delay_type || 'fixed'}
                                onChange={(val) => {
                                    setValue('action_config.delay_type', val);
                                    if (val === 'relative') {
                                        setValue('action_config.offset_unit', 'days');
                                        setValue('action_config.direction', 'before');
                                        setValue('action_config.reference_date', 'appointment_date');
                                    }
                                }}
                                options={[
                                    { value: 'fixed', label: 'Fixed Duration (Wait X time)' },
                                    { value: 'relative', label: 'Relative to Event Date' }
                                ]}
                            />

                            {actionConfig?.delay_type === 'relative' ? (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <FormInput
                                                type="number"
                                                label="Time"
                                                name="action_config.offset_value"
                                                value={actionConfig?.offset_value ?? 1}
                                                onChange={(val) => setValue('action_config.offset_value', parseInt(val))}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <FormSelect
                                                label="Unit"
                                                name="action_config.offset_unit"
                                                value={actionConfig?.offset_unit || 'days'}
                                                onChange={(val) => setValue('action_config.offset_unit', val)}
                                                options={[
                                                    { value: 'minutes', label: 'Minutes' },
                                                    { value: 'hours', label: 'Hours' },
                                                    { value: 'days', label: 'Days' }
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <FormSelect
                                            label="Direction"
                                            name="action_config.direction"
                                            value={actionConfig?.direction || 'before'}
                                            onChange={(val) => setValue('action_config.direction', val)}
                                            options={[
                                                { value: 'before', label: 'Before' },
                                                { value: 'after', label: 'After' }
                                            ]}
                                        />
                                        <FormSelect
                                            label="Reference Event"
                                            name="action_config.reference_date"
                                            value={actionConfig?.reference_date || 'appointment_date'}
                                            onChange={(val) => setValue('action_config.reference_date', val)}
                                            options={[
                                                { value: 'appointment_date', label: 'Appointment Time' },
                                                { value: 'admission_date', label: 'Admission Date' },
                                                { value: 'surgery_date', label: 'Surgery Date' },
                                                { value: 'discharge_date', label: 'Discharge Date' },
                                                { value: 'dob', label: 'Date of Birth' }
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <FormInput
                                            label="At Specific Time (HH:MM)"
                                            placeholder="09:00"
                                            name="action_config.target_time"
                                            value={actionConfig?.target_time || ''}
                                            onChange={(val) => setValue('action_config.target_time', val)}
                                        />
                                        <p className="text-xs text-orange-600 mt-1">Leave empty to use the exact time relative to the event.</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <FormInput
                                                type="number"
                                                label="Wait Duration"
                                                name="action_config.duration_value"
                                                value={actionConfig?.duration_value ?? getValues('delay_days') ?? 0}
                                                onChange={(val) => {
                                                    const num = parseInt(val);
                                                    setValue('action_config.duration_value', num);
                                                    setValue('delay_days', num);
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <FormSelect
                                                label="Unit"
                                                name="action_config.duration_unit"
                                                value={actionConfig?.duration_unit || 'days'}
                                                onChange={(val) => setValue('action_config.duration_unit', val)}
                                                options={[
                                                    { value: 'minutes', label: 'Minutes' },
                                                    { value: 'hours', label: 'Hours' },
                                                    { value: 'days', label: 'Days' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-orange-600 mt-2">The workflow will simply pause here.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {nodeType === 'logic' && (
                        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-amber-900">Condition Rule</label>
                            </div>
                            <Controller
                                name="condition"
                                control={control}
                                render={({ field }) => (
                                    <FormTextarea
                                        label="Logical Expression"
                                        placeholder="e.g. patient.age > 50"
                                        rows={2}
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                )}
                            />
                            <p className="text-xs text-amber-600">
                                Enter a logical expression. If True, flow goes to the Green path. If False, Red path.
                            </p>
                        </div>
                    )}

                    {nodeType === 'communication' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">Message Content</label>
                                <button
                                    type="button"
                                    onClick={() => setShowVariables(!showVariables)}
                                    className="text-xs flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium px-2 py-1 bg-teal-50 rounded-md transition-colors"
                                >
                                    <Variable size={12} />
                                    Insert Variable
                                </button>
                            </div>

                            {/* Variable Picker Dropdown */}
                            {showVariables && (
                                <div className="absolute right-6 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-2 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
                                        <div className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-md">
                                            <Search size={14} className="text-gray-400" />
                                            <input type="text" placeholder="Search variables..." className="text-xs border-none p-0 focus:ring-0 w-full" />
                                        </div>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto p-1">
                                        {variableOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => insertVariable(opt.value)}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors flex items-center justify-between group"
                                            >
                                                <span>{opt.label}</span>
                                                <span className="text-[10px] text-gray-400 font-mono group-hover:text-teal-500">{opt.value}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {actionConfig?.channel === 'email' && (
                                <Controller
                                    name="action_config.subject"
                                    control={control}
                                    render={({ field }) => (
                                        <FormInput
                                            label="Subject Line"
                                            placeholder="Message Subject..."
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    )}
                                />
                            )}

                            <Controller
                                name="action_config.message"
                                control={control}
                                render={({ field }) => (
                                    <FormTextarea
                                        label="Body"
                                        placeholder="Type your message here..."
                                        rows={6}
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                )}
                            />

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Templating</h4>
                                <div className="flex gap-2">
                                    <button type="button" className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:border-teal-300 hover:text-teal-600 transition-colors">
                                        Use Welcome Template
                                    </button>
                                    <button type="button" className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:border-teal-300 hover:text-teal-600 transition-colors">
                                        Use Appointment Reminder
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex gap-3">
                <button
                    type="button"
                    onClick={() => onDelete(nodeId)}
                    className="flex-1 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
                <div className="flex-[2]">
                    <FormButton
                        type="submit"
                        icon={<Save size={16} />}
                        fullWidth
                        onClick={handleSubmit(onSubmit)}
                    >
                        Save Configuration
                    </FormButton>
                </div>
            </div>
        </div>
    );
}
