import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginSchema = z.infer<typeof loginSchema>;


export default function LoginForm() {
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginSchema) => {
        setError(null);
        try {
            await login({
                email: data.email,
                password: data.password,
            });
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Failed to login');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                <p className="mt-2 text-gray-600">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <Input
                    label="Email Address"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                    placeholder="you@example.com"
                />

                <Input
                    label="Password"
                    type="password"
                    {...register('password')}
                    error={errors.password?.message}
                    placeholder="••••••••"
                />

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-gray-600">Remember me</span>
                    </label>
                    <button type="button" onClick={() => navigate('/forgot-password')} className="font-medium text-primary-600 hover:text-primary-500">
                        Forgot password?
                    </button>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center"
                    isLoading={isSubmitting}
                >
                    Sign In
                </Button>

                <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => navigate('/register')} className="font-medium text-primary-600 hover:text-primary-500">
                        Create account
                    </button>
                </p>
            </form>
        </div>
    );
}
