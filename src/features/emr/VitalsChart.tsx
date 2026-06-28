import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts';
import { format } from 'date-fns';
import type { HealthMetric } from '../../services/healthMetricsService';

interface VitalsChartProps {
    data: HealthMetric[];
    type: string;
}

export function VitalsChart({ data, type }: VitalsChartProps) {
    const chartData = useMemo(() => {
        return data.map(d => {
            let systolic, diastolic, val;

            // Handle Blood Pressure Parsing
            if (type === 'blood_pressure') {
                if (typeof d.value === 'string' && d.value.includes('/')) {
                    const parts = d.value.split('/');
                    systolic = parseInt(parts[0]);
                    diastolic = parseInt(parts[1]);
                } else if (typeof d.value === 'object') {
                    systolic = d.value.systolic;
                    diastolic = d.value.diastolic;
                }
            } else {
                // Handle single value metrics
                val = typeof d.value === 'object' ? d.value.value : d.value;
                // Ensure it's a number
                val = Number(val);
            }

            return {
                date: new Date(d.recorded_at).getTime(),
                formattedDate: format(new Date(d.recorded_at), 'MMM d, HH:mm'),
                value: val,
                systolic: systolic,
                diastolic: diastolic,
            };
        });
    }, [data, type]);

    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">No data available</div>;
    }

    const isBP = type === 'blood_pressure';

    return (
        <div style={{ width: '100%', height: 300, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="formattedDate"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickMargin={10}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                    />

                    {isBP ? (
                        <>
                            <Line
                                type="monotone"
                                dataKey="systolic"
                                stroke="#EF4444"
                                strokeWidth={2}
                                dot={{ fill: '#EF4444', r: 4 }}
                                name="Systolic"
                            />
                            <Line
                                type="monotone"
                                dataKey="diastolic"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ fill: '#3B82F6', r: 4 }}
                                name="Diastolic"
                            />
                        </>
                    ) : (
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ fill: '#10B981', r: 4 }}
                            name="Value"
                            activeDot={{ r: 6 }}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
