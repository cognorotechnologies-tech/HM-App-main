import React from 'react';

export interface FormCardProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    gradient?: boolean;
}

export default function FormCard({
    title,
    description,
    icon,
    children,
    className = '',
    gradient = false,
}: FormCardProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
            {/* Header */}
            {(title || description) && (
                <div className={`
                    ${gradient
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gray-50 border-b border-gray-100'
                    } 
                    px-6 py-5
                `}>
                    <div className="flex items-start gap-4">
                        {icon && (
                            <div className={`
                                flex-shrink-0 
                                ${gradient ? 'bg-white/20' : 'bg-blue-100'} 
                                rounded-lg p-3
                            `}>
                                <div className={gradient ? 'text-white' : 'text-blue-600'}>
                                    {icon}
                                </div>
                            </div>
                        )}
                        <div className="flex-1">
                            {title && (
                                <h3 className={`
                                    text-xl font-bold mb-1
                                    ${gradient ? 'text-white' : 'text-gray-900'}
                                `}>
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p className={`
                                    text-sm
                                    ${gradient ? 'text-blue-100' : 'text-gray-600'}
                                `}>
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="px-6 py-6">
                {children}
            </div>
        </div>
    );
}
