import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormTextareaProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    hint?: string;
    rows?: number;
    maxLength?: number;
    showCharCount?: boolean;
}

export default function FormTextarea({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    error,
    hint,
    rows = 4,
    maxLength,
    showCharCount = false,
}: FormTextareaProps) {
    const hasError = Boolean(error);
    const charCount = value.length;
    const showCount = showCharCount || maxLength;

    return (
        <div className="w-full">
            {/* Label */}
            <div className="flex items-center justify-between mb-2">
                <label
                    htmlFor={name}
                    className="block text-sm font-semibold text-gray-700"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Character Count */}
                {showCount && (
                    <span className="text-xs text-gray-500">
                        {charCount}
                        {maxLength && ` / ${maxLength}`}
                    </span>
                )}
            </div>

            {/* Textarea */}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className={`
                    w-full 
                    px-4 py-3
                    text-base text-gray-900
                    placeholder-gray-400
                    bg-white
                    border rounded-lg
                    resize-y
                    transition-all duration-200
                    focus:outline-none focus:ring-2
                    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                    ${hasError
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }
                `}
            />

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
