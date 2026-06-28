import LoginForm from '../features/auth/LoginForm';

export default function PharmacistLogin() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-800">
                <div className="text-center">
                    <span className="text-4xl">💊</span>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Pharmacist Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Pharmacy management access
                    </p>
                </div>

                <LoginForm />
            </div>
        </div>
    );
}
