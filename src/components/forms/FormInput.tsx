import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface FormInputProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    success?: boolean;
    autoComplete?: string;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number;
    pattern?: string;
}

export default function FormInput({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    required = false,
    disabled = false,
    error,
    hint,
    icon,
    success = false,
    autoComplete,
    maxLength,
    min,
    max,
    step,
    pattern,
}: FormInputProps) {
    const hasError = Boolean(error);
    const showSuccess = success && !hasError && value.length > 0;

    return (
        <div className="w-full">
            {/* Label */}
            <label
                htmlFor={name}
                className="block text-sm font-semibold text-gray-700 mb-2"
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Input Container */}
            <div className="relative">
                {/* Left Icon */}
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {icon}
                    </div>
                )}

                {/* Input Field */}
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    min={min}
                    max={max}
                    step={step}
                    pattern={pattern}
                    className={`
                        w-full 
                        ${icon ? 'pl-10' : 'pl-4'} 
                        ${showSuccess ? 'pr-10' : 'pr-4'}
                        py-3
                        text-base text-gray-900
                        placeholder-gray-400
                        bg-white
                        border rounded-lg
                        transition-all duration-200
                        focus:outline-none focus:ring-2
                        disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                        ${hasError
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : showSuccess
                                ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }
                    `}
                />

                {/* Success Checkmark */}
                {showSuccess && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                )}
            </div>

            {/* Hint or Error Message */}
            {hint && !error && (
                <p className="text-xs text-gray-500 mt-1.5">{hint}</p>
            )}

            {error && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 animate-shake">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
}
