import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface FormSelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface FormSelectProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: FormSelectOption[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    hint?: string;
}

export default function FormSelect({
    label,
    name,
    value,
    onChange,
    options,
    placeholder = 'Select an option...',
    required = false,
    disabled = false,
    error,
    hint,
}: FormSelectProps) {
    const hasError = Boolean(error);

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

            {/* Select Container */}
            <div className="relative">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    disabled={disabled}
                    className={`
                        w-full 
                        pl-4 pr-10 py-3
                        text-base text-gray-900
                        bg-white
                        border rounded-lg
                        appearance-none
                        cursor-pointer
                        transition-all duration-200
                        focus:outline-none focus:ring-2
                        disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                        ${hasError
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }
                    `}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Dropdown Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <ChevronDown className="w-5 h-5" />
                </div>
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
