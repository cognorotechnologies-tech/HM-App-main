// @ts-nocheck - Bypassing TypeScript strict checks due to Supabase type conflicts
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Pill, FileText, Activity, BookTemplate } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { prescriptionService, type PrescriptionItemInsert } from '../../services/prescriptionService';
import { pharmacyService } from '../../services/pharmacyService';
import { useToast } from '../../hooks/useToast';
import { prescriptionTemplateService, medicineHistoryService } from '../../services/doctorEnhancementsService';
import { aiService, type DiagnosisSuggestion } from '../../services/aiService';

import { MedicineAutocomplete } from '../../components/MedicineAutocomplete';
import { commonMedicines } from '../../data/medicines';
import { PrescriptionTemplateSelector } from './PrescriptionTemplateSelector';
import { VoiceInput } from '../../components/VoiceInput';

interface PrescriptionEditorProps {
    appointmentId: string;
    patientId: string;
    patient?: any; // Patient data including allergies
    onSaveSuccess?: () => void;
    onMedicinesChange?: (medicines: string[]) => void; // Callback for allergy checking
}

export const PrescriptionEditor: React.FC<PrescriptionEditorProps> = ({
    appointmentId,
    patientId,
    patient,
    onSaveSuccess,
    onMedicinesChange
}) => {
    const { user } = useAuthStore();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // AI State
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<DiagnosisSuggestion[]>([]);

    // Template State
    const [showTemplates, setShowTemplates] = useState(false);

    // Form State
    const [diagnosis, setDiagnosis] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [notes, setNotes] = useState('');

    // Medicine Items
    const [medicines, setMedicines] = useState<Partial<PrescriptionItemInsert>[]>([
        { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);

    const addMedicineRow = () => {
        setMedicines([...medicines, { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeMedicineRow = (index: number) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter((_, i) => i !== index));
        }
    };

    // Stable search handler to prevent MedicineAutocomplete re-renders
    const handleMedicineSearch = React.useCallback(async (query: string) => {
        try {
            const results = await pharmacyService.searchMedicines(query);
            return results.map(m => ({
                name: m.medicine_name,
                category: m.category_name,
                id: m.medicine_id,
                stock: m.total_stock,
                commonDosage: m.unit_of_measurement ? `1 ${m.unit_of_measurement}` : undefined
            }));
        } catch (error) {
            console.error('Error searching medicines:', error);
            return [];
        }
    }, []);

    const updateMedicine = (index: number, field: keyof PrescriptionItemInsert, value: string) => {
        const newMedicines = [...medicines];
        newMedicines[index] = { ...newMedicines[index], [field]: value };
        setMedicines(newMedicines);
    };

    // Track medicine changes for allergy alerts (debounced to prevent infinite loops)
    useEffect(() => {
        if (onMedicinesChange) {
            const medicineNames = medicines
                .filter(m => m.medicine_name?.trim())
                .map(m => m.medicine_name!);

            // Only call if there are actual changes
            const timeoutId = setTimeout(() => {
                onMedicinesChange(medicineNames);
            }, 300); // Debounce for 300ms

            return () => clearTimeout(timeoutId);
        }
    }, [medicines.map(m => m.medicine_name).join(',')]); // Only trigger when medicine names change

    const handleSave = async () => {
        if (!user || !diagnosis.trim()) {
            toast.error('Diagnosis is required');
            return;
        }

        const validMedicines = medicines.filter(m => m.medicine_name?.trim());
        if (validMedicines.length === 0) {
            toast.error('Please add at least one medicine');
            return;
        }

        try {
            setLoading(true);

            // Verify user is a doctor
            if (user?.role !== 'doctor') {
                throw new Error('Only doctors can save prescriptions');
            }
            const doctorId = user.id;

            const prescriptionData = {
                appointment_id: appointmentId,
                patient_id: patientId,
                doctor_id: doctorId,
                diagnosis,
                symptoms,
                notes,
                prescription_number: `RX-${Date.now()}`
            };

            const itemsToSave = validMedicines.map(m => ({
                prescription_id: '',
                medicine_name: m.medicine_name!,
                dosage: m.dosage || '',
                frequency: m.frequency || '',
                duration: m.duration || '',
                route: m.route || null,
                instructions: m.instructions || ''
            })) as PrescriptionItemInsert[];

            const savedPrescription = await prescriptionService.create(prescriptionData, itemsToSave);

            // Track medicine usage for autocomplete history
            try {
                await medicineHistoryService.trackMultiple(
                    validMedicines.map(m => ({
                        medicine_name: m.medicine_name!,
                        dosage: m.dosage || '',
                        frequency: m.frequency || '',
                        duration: m.duration || '',
                        timing: m.instructions || ''
                    }))
                );
            } catch (err) {
                console.error('Failed to track medicine history:', err);
            }

            setSaveSuccess(true);
            toast.success('Prescription saved successfully');
            setTimeout(() => {
                if (onSaveSuccess) onSaveSuccess();
            }, 1000);

        } catch (error: any) {
            console.error(error);
            toast.error('Failed to save prescription: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (saveSuccess) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center animate-scaleIn">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Save className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Prescription Saved!</h3>
                <p className="text-gray-600">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Pill className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Digital Prescription</h3>
                        <p className="text-sm text-gray-600">Write and save prescription details</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Prescription
                        </>
                    )}
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Template Selector Toggle */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow hover:shadow-md"
                    >
                        <BookTemplate className="w-4 h-4" />
                        {showTemplates ? 'Hide Templates' : 'Load Template'}
                    </button>
                    {showTemplates && (
                        <p className="text-xs text-gray-600">Select a template or save current prescription as template</p>
                    )}
                </div>

                {/* Template Selector */}
                {showTemplates && (
                    <div className="animate-slideDown">
                        <PrescriptionTemplateSelector
                            onSelectTemplate={(template) => {
                                setDiagnosis(template.diagnosis || '');
                                setMedicines(template.medicines.map(m => ({
                                    medicine_name: m.medicine_name,
                                    dosage: m.dosage,
                                    frequency: m.frequency,
                                    duration: m.duration,
                                    instructions: m.timing
                                })));
                                setNotes(template.instructions || '');
                                setShowTemplates(false);
                                toast.success(`Template "${template.template_name}" applied!`);
                            }}
                            onSaveAsTemplate={async (data) => {
                                try {
                                    await prescriptionTemplateService.create(data);
                                    toast.success('Template saved successfully!');
                                } catch (error) {
                                    console.error('Failed to save template:', error);
                                    toast.error('Failed to save template');
                                }
                            }}
                            currentFormData={{
                                diagnosis,
                                medicines: medicines.map(m => ({
                                    medicine_name: m.medicine_name || '',
                                    dosage: m.dosage || '',
                                    frequency: m.frequency || '',
                                    duration: m.duration || '',
                                    timing: m.instructions || ''
                                })),
                                instructions: notes
                            }}
                        />
                    </div>
                )}

                {/* Clinical Notes Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-gray-900">Clinical Assessment</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Diagnosis <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!symptoms) {
                                            toast.error('Please enter symptoms first');
                                            return;
                                        }
                                        try {
                                            setLoadingSuggestions(true);
                                            // Calculate age roughly
                                            const birthYear = patient?.date_of_birth ? new Date(patient.date_of_birth).getFullYear() : 2000;
                                            const age = new Date().getFullYear() - birthYear;

                                            const suggestions = await aiService.getDiagnosisSuggestions(
                                                symptoms,
                                                patient?.gender || 'unknown',
                                                age
                                            );
                                            setAiSuggestions(suggestions);
                                        } catch (err) {
                                            toast.error('Failed to get suggestions');
                                        } finally {
                                            setLoadingSuggestions(false);
                                        }
                                    }}
                                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                                >
                                    {loadingSuggestions ? (
                                        <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span className="text-lg">✨</span>
                                    )}
                                    AI Suggest
                                </button>
                            </div>
                            <input
                                type="text"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                placeholder="e.g., Acute Bronchitis"
                            />
                            {/* AI Suggestions Dropdown */}
                            {aiSuggestions.length > 0 && (
                                <div className="mt-2 space-y-2 animate-slideDown">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">AI Suggestions:</p>
                                    <div className="grid gap-2">
                                        {aiSuggestions.map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setDiagnosis(suggestion.diagnosis);
                                                    setAiSuggestions([]);
                                                }}
                                                className="text-left p-3 bg-white border border-indigo-100 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium text-gray-800 group-hover:text-indigo-700">{suggestion.diagnosis}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${suggestion.confidence === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {suggestion.confidence}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{suggestion.reasoning}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Symptoms</label>
                                <VoiceInput
                                    onTranscript={(text) => setSymptoms(prev => prev ? `${prev} ${text}` : text)}
                                />
                            </div>
                            <input
                                type="text"
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                placeholder="e.g., Cough, Fever, Fatigue"
                            />
                        </div>
                    </div>
                </div>

                {/* Medicines Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Pill className="w-5 h-5 text-green-600" />
                            <h4 className="font-bold text-gray-900">Prescribed Medicines</h4>
                        </div>
                        <button
                            onClick={addMedicineRow}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all shadow hover:shadow-md transform hover:scale-105"
                        >
                            <Plus className="w-4 h-4" />
                            Add Medicine
                        </button>
                    </div>

                    <div className="space-y-3">
                        {medicines.map((med, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border-2 border-green-100 hover:border-green-200 transition-all animate-slideUp">
                                <div className="flex gap-3 items-start">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                                        <div className="col-span-1 md:col-span-4">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Medicine Name *
                                            </label>
                                            <MedicineAutocomplete
                                                value={med.medicine_name || ''}
                                                onChange={(value) => updateMedicine(idx, 'medicine_name', value)}
                                                onSearch={handleMedicineSearch}
                                                onSelectMedicine={(medicine) => {
                                                    // Auto-fill dosage and frequency
                                                    updateMedicine(idx, 'medicine_name', medicine.name);
                                                    if (medicine.commonDosage && !med.dosage) {
                                                        updateMedicine(idx, 'dosage', medicine.commonDosage);
                                                    }
                                                    if (medicine.commonFrequency && !med.frequency) {
                                                        updateMedicine(idx, 'frequency', medicine.commonFrequency);
                                                    }
                                                }}
                                                placeholder="Search pharmacy inventory..."
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Dosage
                                            </label>
                                            <input
                                                type="text"
                                                value={med.dosage}
                                                onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                                                placeholder="500mg"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Frequency
                                            </label>
                                            <input
                                                type="text"
                                                value={med.frequency}
                                                onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                                                placeholder="1-0-1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Duration
                                            </label>
                                            <input
                                                type="text"
                                                value={med.duration}
                                                onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                                                placeholder="5 days"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Instructions
                                            </label>
                                            <input
                                                type="text"
                                                value={med.instructions}
                                                onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                                                placeholder="After food"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeMedicineRow(idx)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0 md:mt-6"
                                        title="Remove medicine"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-amber-600" />
                            <label className="block text-sm font-bold text-gray-900">
                                Additional Notes & Advice
                            </label>
                        </div>
                        <VoiceInput
                            onTranscript={(text) => setNotes(prev => prev ? `${prev} ${text}` : text)}
                        />
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                        placeholder="Add any additional advice, precautions, or follow-up instructions for the patient..."
                    />
                </div>
            </div >
        </div >
    );
};
