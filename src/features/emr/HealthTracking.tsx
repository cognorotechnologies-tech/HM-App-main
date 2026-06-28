import { useState, useEffect } from 'react';
import { Plus, Activity, TrendingUp, History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { AddVitalModal } from './AddVitalModal';
import { VitalsChart } from './VitalsChart';
import { healthMetricsService, type HealthMetric, type MetricType } from '../../services/healthMetricsService';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

const METRIC_TABS: { id: MetricType; label: string; color: string }[] = [
    { id: 'blood_pressure', label: 'Blood Pressure', color: 'bg-red-500' },
    { id: 'blood_sugar', label: 'Blood Sugar', color: 'bg-blue-500' },
    { id: 'heart_rate', label: 'Heart Rate', color: 'bg-pink-500' },
    { id: 'weight', label: 'Weight', color: 'bg-green-500' },
    { id: 'temperature', label: 'Temperature', color: 'bg-orange-500' },
];

export default function HealthTracking() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<MetricType>('blood_pressure');
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const patientId = user?.id;

    const fetchMetrics = async () => {
        if (!patientId) return;
        try {
            setLoading(true);
            const data = await healthMetricsService.getAll({ patient_id: patientId, metric_type: activeTab });
            setMetrics(data);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, [patientId, activeTab]);

    // Calculate quick stats (Current, Avg)
    const latest = metrics.length > 0 ? metrics[metrics.length - 1] : null;

    const renderLatestValue = () => {
        if (!latest) return '-';
        const val = latest.value as any;
        if (activeTab === 'blood_pressure') return `${val.systolic}/${val.diastolic} mmHg`;
        return `${val.value} ${latest.unit}`;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Activity className="text-blue-600" />
                        Health Tracking
                    </h1>
                    <p className="text-gray-500 mt-1">Monitor your vital signs and health trends over time.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white shadow-lg">
                    <Plus size={20} /> Add New Record
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar / Tabs */}
                <div className="lg:col-span-1 space-y-2">
                    {METRIC_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between
                                ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:pl-5'}
                            `}
                        >
                            <span>{tab.label}</span>
                            {activeTab === tab.id && <div className={`w-2 h-2 rounded-full ${tab.color}`}></div>}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Latest Reading</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{renderLatestValue()}</h3>
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                <History size={12} />
                                {latest ? format(new Date(latest.recorded_at), 'MMM d, h:mm a') : 'No data'}
                            </p>
                        </div>
                        {/* More stats placeholder - e.g. Trend or Average */}
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp size={20} className="text-gray-400" />
                                Trends
                            </h3>
                        </div>
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <VitalsChart data={metrics} type={activeTab} />
                        )}
                    </div>

                    {/* Recent History Table */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-800">Recent History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Value</th>
                                        <th className="px-6 py-3">Unit</th>
                                        <th className="px-6 py-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[...metrics].reverse().slice(0, 5).map(metric => {
                                        const val = metric.value as any;
                                        const displayVal = activeTab === 'blood_pressure'
                                            ? `${val.systolic}/${val.diastolic}`
                                            : val.value;

                                        return (
                                            <tr key={metric.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 text-gray-900 font-medium">
                                                    {format(new Date(metric.recorded_at), 'MMM d, yyyy h:mm a')}
                                                </td>
                                                <td className="px-6 py-3 text-gray-800">{displayVal}</td>
                                                <td className="px-6 py-3 text-gray-500">{metric.unit}</td>
                                                <td className="px-6 py-3 text-gray-500 truncate max-w-xs">{metric.notes || '-'}</td>
                                            </tr>
                                        );
                                    })}
                                    {metrics.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {patientId && (
                <AddVitalModal
                    patientId={patientId}
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={fetchMetrics}
                />
            )}
        </div>
    );
}
