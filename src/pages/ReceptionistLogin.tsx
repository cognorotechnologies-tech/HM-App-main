import { Link } from 'react-router-dom';
import LoginForm from '../features/auth/LoginForm';

export default function ReceptionistLogin() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border border-teal-200">
                <div>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-teal-100">
                        <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Receptionist Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Front Desk Access
                    </p>
                </div>
                <LoginForm />
                <div className="text-center">
                    <Link to="/login" className="text-sm text-teal-600 hover:text-teal-500">
                        ← Back to login selection
                    </Link>
                </div>
            </div>
        </div>
    );
}
