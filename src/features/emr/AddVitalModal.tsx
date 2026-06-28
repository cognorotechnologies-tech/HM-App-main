import { useState } from 'react';
import { X, Activity, Save } from 'lucide-react';
import { Button } from '../../components/Button';
import { healthMetricsService, type NewHealthMetric, type MetricType } from '../../services/healthMetricsService';

interface AddVitalModalProps {
    patientId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const METRIC_TYPES: { value: MetricType; label: string; unit: string; complex?: boolean }[] = [
    { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', complex: true },
    { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL' },
    { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm' },
    { value: 'weight', label: 'Weight', unit: 'kg' },
    { value: 'height', label: 'Height', unit: 'cm' },
    { value: 'temperature', label: 'Temperature', unit: '°F' },
    { value: 'spo2', label: 'SpO2', unit: '%' },
];

export function AddVitalModal({ patientId, isOpen, onClose, onSuccess }: AddVitalModalProps) {
    const [type, setType] = useState<MetricType>('blood_pressure');
    const [value, setValue] = useState('');
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const selectedType = METRIC_TYPES.find(t => t.value === type);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            let metricValue: any;
            if (type === 'blood_pressure') {
                if (!systolic || !diastolic) {
                    alert('Please enter both Systolic and Diastolic values');
                    setLoading(false);
                    return;
                }
                metricValue = { systolic: Number(systolic), diastolic: Number(diastolic) };
            } else {
                if (!value) {
                    alert('Please enter a value');
                    setLoading(false);
                    return;
                }
                metricValue = { value: Number(value) };
            }

            const payload: NewHealthMetric = {
                patient_id: patientId,
                metric_type: type,
                value: metricValue,
                unit: selectedType?.unit || '',
                recorded_at: new Date().toISOString(),
                notes: notes || null
            };

            await healthMetricsService.create(payload);
            onSuccess();
            onClose();
            // Reset form
            setValue('');
            setSystolic('');
            setDiastolic('');
            setNotes('');

        } catch (error) {
            console.error('Error adding vital:', error);
            alert('Failed to add vital');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="text-blue-600" size={20} />
                        Add Vitals
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vital Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as MetricType)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {METRIC_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {type === 'blood_pressure' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Systolic</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={systolic}
                                        onChange={(e) => setSystolic(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="120"
                                    />
                                    <span className="absolute right-3 top-2 text-gray-400 text-sm">mmHg</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diastolic</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={diastolic}
                                        onChange={(e) => setDiastolic(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="80"
                                    />
                                    <span className="absolute right-3 top-2 text-gray-400 text-sm">mmHg</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Value ({selectedType?.unit})</label>
                            <input
                                type="number"
                                step="0.01"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="e.g., Before breakfast"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="flex items-center gap-2">
                            <Save size={16} />
                            {loading ? 'Saving...' : 'Save Record'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
