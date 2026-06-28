import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { healthMetricsService, type HealthMetric } from '../../../services/healthMetricsService';
import { format } from 'date-fns';
import { TrendingUp, Activity } from 'lucide-react';

interface MetricChartsProps {
    patientId: string;
    refreshTrigger?: number;
}

type MetricType = 'blood_pressure' | 'blood_sugar' | 'weight' | 'temperature' | 'heart_rate';

export default function MetricCharts({ patientId, refreshTrigger }: MetricChartsProps) {
    const [activeMetric, setActiveMetric] = useState<MetricType>('blood_pressure');
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadMetrics();
        loadStats();
    }, [patientId, activeMetric, refreshTrigger]);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const data = await healthMetricsService.getTrends(patientId, activeMetric, 30);
            setMetrics(data);
        } catch (error) {
            console.error('Error loading metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await healthMetricsService.getStats(patientId, activeMetric, 30);
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const getChartData = () => {
        return metrics.map((m) => {
            const date = format(new Date(m.recorded_at), 'MMM dd');

            // Note: Blood pressure now stored as single value, may need backend adjustment
            // For now, use the value as-is
            return {
                date,
                value: m.value,
            };
        });
    };

    const getMetricLabel = () => {
        switch (activeMetric) {
            case 'blood_pressure':
                return 'Blood Pressure (mmHg)';
            case 'blood_sugar':
                return 'Blood Sugar (mg/dL)';
            case 'weight':
                return 'Weight (kg)';
            case 'temperature':
                return 'Temperature (°F)';
            case 'heart_rate':
                return 'Heart Rate (bpm)';
        }
    };

    const chartData = getChartData();

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Health Trends</h3>
                </div>
            </div>

            {/* Metric Type Selector */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {(['blood_pressure', 'blood_sugar', 'weight', 'temperature', 'heart_rate'] as MetricType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveMetric(type)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeMetric === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                ))}
            </div>

            {/* Statistics Cards */}
            {stats && stats.count > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Average</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.average}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Minimum</p>
                        <p className="text-2xl font-bold text-green-600">{stats.min}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Maximum</p>
                        <p className="text-2xl font-bold text-red-600">{stats.max}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Readings</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.count}</p>
                    </div>
                </div>
            )}

            {/* Chart */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : chartData.length === 0 ? (
                <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No data recorded yet</p>
                    <p className="text-gray-400 text-sm mt-1">Start recording your {getMetricLabel().toLowerCase()}</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {activeMetric === 'blood_pressure' ? (
                            <>
                                <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={2} name="Systolic" />
                                <Line type="monotone" dataKey="diastolic" stroke="#10b981" strokeWidth={2} name="Diastolic" />
                            </>
                        ) : (
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name={getMetricLabel()} />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            )}

            <p className="text-sm text-gray-500 text-center mt-4">
                Showing last 30 days of data
            </p>
        </div>
    );
}
