import LoginForm from '../features/auth/LoginForm';

export default function DoctorLogin() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border border-cyan-200">
                <div className="text-center">
                    <span className="text-4xl">👨‍⚕️</span>
                    <h2 className="mt-6 text-3xl font-extrabold text-cyan-900">
                        Doctor Portal
                    </h2>
                    <p className="mt-2 text-sm text-cyan-700">
                        Sign in to manage your schedule and patients
                    </p>
                </div>

                <LoginForm />

                <div className="text-center mt-4 text-xs text-gray-400">
                    Use your hospital credentials
                </div>
            </div>
        </div>
    );
}
