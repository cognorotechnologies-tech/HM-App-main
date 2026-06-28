import { useCounterAnimation } from '../hooks/useCounterAnimation';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { type FC } from 'react';

interface StatCardProps {
    title: string;
    value: number;
    icon: FC<{ size?: number; className?: string }>;  // Generic function component
    gradient: string;
    iconBg: string;
    trend?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    onClick?: () => void;
    loading?: boolean;
}

export default function StatCard({
    title,
    value,
    icon: IconComponent,
    gradient,
    iconBg,
    trend,
    onClick,
    loading = false
}: StatCardProps) {
    const animatedValue = useCounterAnimation(value, 1500);

    if (loading) {
        return (
            <div className={`${gradient} rounded-2xl p-6 border-2 border-white/20 shadow-xl`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-white/30 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-white/40 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${gradient} rounded-2xl p-6 border-2 border-white/20 shadow-xl hover:shadow-2xl 
                       transform hover:scale-105 transition-all duration-300 cursor-pointer 
                       relative overflow-hidden group`}
            onClick={onClick}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 
                          group-hover:scale-150 transition-transform duration-500"></div>

            <div className="relative z-10">
                {/* Header with Icon */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`${iconBg} p-3 rounded-xl shadow-lg transform group-hover:rotate-6 
                                   transition-transform duration-300`}>
                        <IconComponent size={24} className="text-white" />
                    </div>

                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
                                      ${trend.isPositive ? 'bg-green-500/20 text-green-700' :
                                trend.value === 0 ? 'bg-gray-500/20 text-gray-700' :
                                    'bg-red-500/20 text-red-700'}`}>
                            {trend.isPositive ? <TrendingUp size={12} /> :
                                trend.value === 0 ? <Minus size={12} /> :
                                    <TrendingDown size={12} />}
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>

                {/* Value */}
                <h3 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {animatedValue.toLocaleString()}
                </h3>

                {/* Title */}
                <p className="text-sm font-medium text-white/80 uppercase tracking-wide">
                    {title}
                </p>

                {/* Trend Label */}
                {trend?.label && (
                    <p className="text-xs text-white/60 mt-1">
                        {trend.label}
                    </p>
                )}
            </div>

            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                          -translate-x-full group-hover:translate-x-full transition-transform duration-1000">
            </div>
        </div>
    );
}
