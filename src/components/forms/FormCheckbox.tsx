import React from 'react';
import { Check } from 'lucide-react';

export interface FormCheckboxProps {
    label: string;
    name: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    error?: string;
    description?: string;
}

export default function FormCheckbox({
    label,
    name,
    checked,
    onChange,
    disabled = false,
    error,
    description,
}: FormCheckboxProps) {
    return (
        <div className="w-full">
            <div className="flex items-start gap-3">
                {/* Custom Checkbox */}
                <div className="flex items-center h-6">
                    <input
                        type="checkbox"
                        id={name}
                        name={name}
                        checked={checked}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={disabled}
                        className="sr-only peer"
                    />
                    <label
                        htmlFor={name}
                        className={`
                            relative w-5 h-5 
                            border-2 rounded
                            cursor-pointer
                            transition-all duration-200
                            peer-checked:bg-blue-600 peer-checked:border-blue-600
                            peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2
                            ${checked
                                ? 'bg-blue-600 border-blue-600'
                                : error
                                    ? 'border-red-500'
                                    : 'border-gray-300 bg-white'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}
                        `}
                    >
                        {checked && (
                            <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                    </label>
                </div>

                {/* Label and Description */}
                <div className="flex-1">
                    <label
                        htmlFor={name}
                        className={`
                            block text-sm font-medium cursor-pointer
                            ${disabled ? 'text-gray-400' : 'text-gray-700'}
                        `}
                    >
                        {label}
                    </label>
                    {description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            {description}
                        </p>
                    )}
                    {error && (
                        <p className="text-xs text-red-600 mt-1">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
