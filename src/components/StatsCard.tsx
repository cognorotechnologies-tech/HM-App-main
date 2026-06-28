import type { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: string;
    gradient?: string; // Support linear gradients from develop
    iconBg?: string; // Support icon background
    iconColor?: string; // Support icon color
    bgGradient?: string; // Support new prop name from DoctorDashboard?
}

export default function StatsCard({ title, value, icon, trend, color = 'blue', gradient, iconBg, iconColor, bgGradient }: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        cyan: 'bg-cyan-50 text-cyan-600',
    }[color] || 'bg-blue-50 text-blue-600';

    // If gradient is provided, render different style (new style)
    if (gradient || bgGradient) {
        const activeGradient = gradient || bgGradient;
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${activeGradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {icon}
                    </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <div className={`mt-3 h-1.5 bg-gradient-to-r ${activeGradient} rounded-full`}></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colorClasses} flex items-center justify-center`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        <span>{trend.isPositive ? '↗' : '↘'}</span>
                        <span className="ml-1">{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-gray-600 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
        </div>
    );
}
