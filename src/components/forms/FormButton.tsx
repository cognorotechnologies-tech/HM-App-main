import React from 'react';
import { Loader2 } from 'lucide-react';

export interface FormButtonProps {
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
    className?: string;
}

export default function FormButton({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    onClick,
    className = '',
}: FormButtonProps) {
    const isDisabled = disabled || loading;

    // Variant styles
    const variantStyles = {
        primary: `
            bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 
            text-white font-bold
            shadow-xl shadow-blue-500/30
            hover:shadow-2xl hover:shadow-blue-500/40
            hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800
            transform hover:-translate-y-0.5
            border border-blue-500/20
        `,
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg',
        outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
        danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl',
        success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl',
    };

    // Size styles
    const sizeStyles = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`
                ${fullWidth ? 'w-full flex' : 'inline-flex'}
                items-center justify-center gap-3
                ${sizeStyles[size]}
                ${variantStyles[variant]}
                font-semibold rounded-xl
                transition-all duration-300 ease-out
                transform active:scale-95
                focus:outline-none focus:ring-4 focus:ring-offset-2
                ${variant === 'primary' ? 'focus:ring-blue-500/50' : ''}
                ${variant === 'danger' ? 'focus:ring-red-500/50' : ''}
                ${variant === 'success' ? 'focus:ring-green-500/50' : ''}
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                ${className}
            `}
        >
            {loading && (
                <Loader2 className={`${iconSizes[size]} animate-spin`} />
            )}

            {!loading && icon && iconPosition === 'left' && icon}

            {children}

            {!loading && icon && iconPosition === 'right' && icon}
        </button>
    );
}
