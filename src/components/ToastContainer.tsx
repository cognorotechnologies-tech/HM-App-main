import { useToast } from '../contexts/ToastContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

interface ToastProps {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    onClose: () => void;
}

function Toast({ message, type, duration, onClose }: ToastProps) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!duration || duration <= 0) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / (duration / 50));
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [duration]);

    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-800',
            iconColor: 'text-green-600',
            progressColor: 'bg-green-600',
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            iconColor: 'text-red-600',
            progressColor: 'bg-red-600',
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            iconColor: 'text-blue-600',
            progressColor: 'bg-blue-600',
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-800',
            iconColor: 'text-yellow-600',
            progressColor: 'bg-yellow-600',
        },
    };

    const { icon: Icon, bgColor, borderColor, textColor, iconColor, progressColor } = config[type];

    return (
        <div
            className={`${bgColor} ${borderColor} border-2 rounded-lg shadow-lg p-4 min-w-[320px] animate-slide-in-right overflow-hidden`}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <Icon className={`${iconColor} flex-shrink-0 mt-0.5`} size={20} />
                <p className={`${textColor} flex-1 text-sm font-medium leading-relaxed`}>{message}</p>
                <button
                    onClick={onClose}
                    className={`${textColor} hover:opacity-70 transition-opacity flex-shrink-0`}
                    aria-label="Close notification"
                >
                    <X size={18} />
                </button>
            </div>
            {duration && duration > 0 && (
                <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${progressColor} transition-all duration-50 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
