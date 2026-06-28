import { useState } from 'react';
import { Plus, Activity } from 'lucide-react';
import { healthMetricsService, type NewHealthMetric } from '../../../services/healthMetricsService';
import { useToast } from '../../../contexts/ToastContext';

interface MetricEntryProps {
    patientId: string;
    onSuccess?: () => void;
}

type MetricType = 'blood_pressure' | 'blood_sugar' | 'weight' | 'height' | 'temperature' | 'heart_rate';

export default function MetricEntry({ patientId, onSuccess }: MetricEntryProps) {
    const toast = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [metricType, setMetricType] = useState<MetricType>('blood_pressure');
    const [saving, setSaving] = useState(false);

    // Blood Pressure
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');

    // Single value metrics
    const [value, setValue] = useState('');
    const [notes, setNotes] = useState('');

    const getUnit = (type: MetricType): string => {
        switch (type) {
            case 'blood_pressure':
                return 'mmHg';
            case 'blood_sugar':
                return 'mg/dL';
            case 'weight':
                return 'kg';
            case 'height':
                return 'cm';
            case 'temperature':
                return '°F';
            case 'heart_rate':
                return 'bpm';
            default:
                return '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // For blood pressure, we'll store systolic as the value
        // and add notes to indicate it's BP with both readings
        let metricValue: number;
        let metricNotes = notes.trim();

        if (metricType === 'blood_pressure') {
            if (!systolic || !diastolic) {
                toast.error('Please enter both systolic and diastolic values');
                return;
            }
            metricValue = parseInt(systolic);
            metricNotes = `BP: ${systolic}/${diastolic}${metricNotes ? ' - ' + metricNotes : ''}`;
        } else {
            if (!value) {
                toast.error('Please enter a value');
                return;
            }
            metricValue = parseFloat(value);
        }

        const metric: NewHealthMetric = {
            patient_id: patientId,
            metric_type: metricType,
            value: metricValue,
            unit: getUnit(metricType),
            notes: metricNotes || undefined,
        };

        setSaving(true);

        try {
            await healthMetricsService.record(metric);
            toast.success('Health metric recorded successfully!');

            // Reset form
            setSystolic('');
            setDiastolic('');
            setValue('');
            setNotes('');
            setIsOpen(false);

            onSuccess?.();
        } catch (error: any) {
            console.error('Error recording metric:', error);
            toast.error(error.message || 'Failed to record metric');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Record Health Metric</h3>
                </div>
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Metric
                    </button>
                )}
            </div>

            {isOpen && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Metric Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Metric Type *
                        </label>
                        <select
                            value={metricType}
                            onChange={(e) => {
                                setMetricType(e.target.value as MetricType);
                                // Reset values when changing type
                                setSystolic('');
                                setDiastolic('');
                                setValue('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="blood_pressure">Blood Pressure</option>
                            <option value="blood_sugar">Blood Sugar</option>
                            <option value="weight">Weight</option>
                            <option value="height">Height</option>
                            <option value="temperature">Temperature</option>
                            <option value="heart_rate">Heart Rate</option>
                        </select>
                    </div>

                    {/* Value Input */}
                    {metricType === 'blood_pressure' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Systolic (mmHg) *
                                </label>
                                <input
                                    type="number"
                                    value={systolic}
                                    onChange={(e) => setSystolic(e.target.value)}
                                    placeholder="120"
                                    min="70"
                                    max="200"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Diastolic (mmHg) *
                                </label>
                                <input
                                    type="number"
                                    value={diastolic}
                                    onChange={(e) => setDiastolic(e.target.value)}
                                    placeholder="80"
                                    min="40"
                                    max="130"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Value ({getUnit(metricType)}) *
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={
                                    metricType === 'blood_sugar' ? '100' :
                                        metricType === 'weight' ? '70' :
                                            metricType === 'height' ? '170' :
                                                metricType === 'temperature' ? '98.6' :
                                                    '72'
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Add any notes about this reading..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save Metric'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
