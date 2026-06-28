import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/Input';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterSchema = z.infer<typeof registerSchema>;

export default function RegisterForm() {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const toast = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
    });

    const { register: registerUser } = useAuthStore();

    const onSubmit = async (data: RegisterSchema) => {
        setError(null);
        try {
            await registerUser({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'patient', // Default role
            });

            toast.success("Registration successful!");
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Failed to register');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <Input
                    id="firstName"
                    label="First Name"
                    {...register('firstName')}
                    error={errors.firstName?.message}
                />
                <Input
                    id="lastName"
                    label="Last Name"
                    {...register('lastName')}
                    error={errors.lastName?.message}
                />
            </div>

            <Input
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
            />

            <Input
                id="phone"
                label="Phone (Optional)"
                type="tel"
                autoComplete="tel"
                {...register('phone')}
                error={errors.phone?.message}
            />

            <Input
                id="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                error={errors.password?.message}
            />

            <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
            />

            <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
            >
                Sign up
            </Button>
        </form>
    );
}
