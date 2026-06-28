// @ts-nocheck - Bypassing TypeScript strict checks due to Supabase type conflicts
import { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import type { WhatsAppTemplate } from '../../services/whatsappService';

interface VariableMappingProps {
    template: WhatsAppTemplate | null;
    onMappingChange: (mapping: Record<string, any>) => void;
    context?: 'campaign' | 'workflow';
}

export default function WhatsAppVariableMapper({ template, onMappingChange, context = 'campaign' }: VariableMappingProps) {
    const [variableMapping, setVariableMapping] = useState<Record<string, any>>({});
    const [customValues, setCustomValues] = useState<Record<string, string>>({});
    const [preview, setPreview] = useState<string>('');

    // Data source options based on context
    const dataSourceOptions = {
        patient: [
            { value: 'patient.first_name', label: 'Patient First Name' },
            { value: 'patient.last_name', label: 'Patient Last Name' },
            { value: 'patient.full_name', label: 'Patient Full Name' },
            { value: 'patient.phone', label: 'Patient Phone' },
            { value: 'patient.email', label: 'Patient Email' },
            { value: 'patient.age', label: 'Patient Age' },
            { value: 'patient.gender', label: 'Patient Gender' },
        ],
        doctor: [
            { value: 'doctor.first_name', label: 'Doctor First Name' },
            { value: 'doctor.last_name', label: 'Doctor Last Name' },
            { value: 'doctor.full_name', label: 'Doctor Full Name' },
            { value: 'doctor.specialization', label: 'Doctor Specialization' },
        ],
        appointment: [
            { value: 'appointment.date', label: 'Appointment Date' },
            { value: 'appointment.time', label: 'Appointment Time' },
            { value: 'appointment.datetime', label: 'Appointment Date & Time' },
            { value: 'appointment.type', label: 'Appointment Type' },
            { value: 'appointment.status', label: 'Appointment Status' },
        ],
        clinic: [
            { value: 'clinic.name', label: 'Clinic Name' },
            { value: 'clinic.address', label: 'Clinic Address' },
            { value: 'clinic.phone', label: 'Clinic Phone' },
            { value: 'clinic.email', label: 'Clinic Email' },
        ],
        custom: [
            { value: 'custom', label: '✏️ Custom Value...' }
        ]
    };

    const allOptions = [
        { label: 'Patient Data', options: dataSourceOptions.patient },
        { label: 'Doctor Data', options: dataSourceOptions.doctor },
        { label: 'Appointment Data', options: dataSourceOptions.appointment },
        { label: 'Clinic Data', options: dataSourceOptions.clinic },
        { label: 'Custom', options: dataSourceOptions.custom },
    ];

    useEffect(() => {
        if (template && template.variables) {
            // Initialize with smart defaults
            const defaultMapping: Record<string, any> = {};
            template.variables.forEach((varName: string) => {
                // Auto-map common variables
                if (varName.includes('patient_name') || varName === 'patient_name') {
                    defaultMapping[varName] = 'patient.full_name';
                } else if (varName.includes('doctor_name') || varName === 'doctor_name') {
                    defaultMapping[varName] = 'doctor.full_name';
                } else if (varName.includes('appointment_date')) {
                    defaultMapping[varName] = 'appointment.date';
                } else if (varName.includes('appointment_time')) {
                    defaultMapping[varName] = 'appointment.time';
                } else if (varName.includes('clinic') || varName.includes('address')) {
                    defaultMapping[varName] = 'clinic.address';
                }
            });
            setVariableMapping(defaultMapping);
            onMappingChange(defaultMapping);
        }
    }, [template]);

    useEffect(() => {
        updatePreview();
    }, [variableMapping, customValues, template]);

    const handleMappingChange = (varName: string, source: string) => {
        const updated = { ...variableMapping, [varName]: source };
        setVariableMapping(updated);
        onMappingChange(updated);
    };

    const handleCustomValueChange = (varName: string, value: string) => {
        const updated = { ...customValues, [varName]: value };
        setCustomValues(updated);

        // Update mapping to use custom value
        const mappingUpdated = { ...variableMapping, [varName]: `custom:${value}` };
        setVariableMapping(mappingUpdated);
        onMappingChange(mappingUpdated);
    };

    const updatePreview = () => {
        if (!template) return;

        let previewText = template.content;

        template.variables?.forEach((varName: string, index: number) => {
            const placeholder = `{{${index + 1}}}`;
            const mapping = variableMapping[varName];

            let value = '';
            if (mapping === 'custom' || mapping?.startsWith('custom:')) {
                value = customValues[varName] || mapping?.replace('custom:', '') || `[${varName}]`;
            } else if (mapping) {
                // Show the field name for preview
                const option = allOptions
                    .flatMap(g => g.options)
                    .find(o => o.value === mapping);
                value = `[${option?.label || varName}]`;
            } else {
                value = `[${varName}]`;
            }

            previewText = previewText.replace(new RegExp(placeholder, 'g'), value);
        });

        setPreview(previewText);
    };

    if (!template) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-yellow-900">No Template Selected</p>
                    <p className="text-sm text-yellow-700">Please select a WhatsApp template first</p>
                </div>
            </div>
        );
    }

    const hasVariables = template.variables && template.variables.length > 0;

    return (
        <div className="space-y-6">
            {/* Variable Mapping Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Map Template Variables
                </h3>

                {!hasVariables ? (
                    <p className="text-gray-500 text-sm">This template has no variables to map.</p>
                ) : (
                    <div className="space-y-4">
                        {template.variables.map((varName: string, index: number) => {
                            const isCustom = variableMapping[varName] === 'custom';

                            return (
                                <div key={varName} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-start gap-4">
                                        {/* Position Badge */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {index + 1}
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            {/* Variable Name */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Variable: <code className="text-green-700 bg-green-50 px-2 py-0.5 rounded">
                                                        {'{{'}{index + 1}{'}'} - {varName}
                                                    </code>
                                                </label>
                                            </div>

                                            {/* Data Source Select */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                                    Data Source
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={variableMapping[varName] || ''}
                                                        onChange={(e) => handleMappingChange(varName, e.target.value)}
                                                        className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select data source...</option>
                                                        {allOptions.map((group) => (
                                                            <optgroup key={group.label} label={group.label}>
                                                                {group.options.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Custom Value Input */}
                                            {isCustom && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600 mb-2">
                                                        Custom Value
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={customValues[varName] || ''}
                                                        onChange={(e) => handleCustomValueChange(varName, e.target.value)}
                                                        placeholder={`Enter value for ${varName}...`}
                                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Preview Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Message Preview
                </h3>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {preview || template.content}
                    </p>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                    <strong>Note:</strong> Values in [brackets] will be replaced with actual patient/appointment data when sent.
                </p>
            </div>

            {/* Mapping Summary */}
            {hasVariables && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Variable Mapping Summary</h4>
                    <div className="space-y-1 text-sm">
                        {template.variables.map((varName: string, index: number) => {
                            const mapping = variableMapping[varName];
                            const option = allOptions
                                .flatMap(g => g.options)
                                .find(o => o.value === mapping);

                            return (
                                <div key={varName} className="flex items-center gap-2">
                                    <code className="text-green-700 bg-white px-2 py-0.5 rounded font-mono text-xs">
                                        {'{{'}{index + 1}{'}}'} {varName}
                                    </code>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-blue-700 font-medium">
                                        {mapping?.startsWith('custom:')
                                            ? `"${mapping.replace('custom:', '')}"`
                                            : option?.label || 'Not mapped'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
