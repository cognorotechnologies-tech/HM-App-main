import { Link } from 'react-router-dom';
import RegisterForm from '../features/auth/RegisterForm';
import SocialLoginButton from '../components/SocialLoginButton';

export default function Register() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                {/* Header */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Join Us Today!
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create your account to get started
                    </p>
                </div>

                {/* Social Login Section */}
                <div className="space-y-3">
                    <SocialLoginButton provider="google" />

                    <div className="grid grid-cols-2 gap-3">
                        <SocialLoginButton provider="github" />
                        <SocialLoginButton provider="apple" />
                    </div>
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with email</span>
                    </div>
                </div>

                {/* Email Registration Form */}
                <RegisterForm />

                {/* Sign In Link */}
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
