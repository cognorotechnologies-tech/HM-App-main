import { Link } from 'react-router-dom';
import LoginForm from '../features/auth/LoginForm';

export default function PatientLogin() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Patient Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to book appointments and view your medical records
                    </p>
                </div>

                <LoginForm />

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
