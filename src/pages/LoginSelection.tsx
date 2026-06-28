import { Link } from 'react-router-dom';

export default function LoginSelection() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Select Your Portal</h1>
                    <p className="text-xl text-gray-600">Please choose the appropriate login portal to continue.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Patient Card */}
                    <Link to="/login/patient" className="group block">
                        <div className="h-fullbg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all text-center">
                            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🏥</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient</h2>
                            <p className="text-gray-600">Book appointments, view prescriptions, and manage medical history.</p>
                            <div className="mt-6 inline-block px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                Patient Login &rarr;
                            </div>
                        </div>
                    </Link>

                    {/* Doctor Card */}
                    <Link to="/login/doctor" className="group block">
                        <div className="h-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-cyan-500 hover:shadow-xl transition-all text-center">
                            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">👨‍⚕️</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor</h2>
                            <p className="text-gray-600">Manage schedule, view appointments, and write prescriptions.</p>
                            <div className="mt-6 inline-block px-6 py-2 bg-cyan-50 text-cyan-600 rounded-full text-sm font-semibold group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                Doctor Login &rarr;
                            </div>
                        </div>
                    </Link>

                    {/* Admin Card */}
                    <Link to="/login/admin" className="group block">
                        <div className="h-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-gray-800 hover:shadow-xl transition-all text-center">
                            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">⚙️</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin</h2>
                            <p className="text-gray-600">Manage doctors, departments, patients, and system settings.</p>
                            <div className="mt-6 inline-block px-6 py-2 bg-gray-50 text-gray-800 rounded-full text-sm font-semibold group-hover:bg-gray-800 group-hover:text-white transition-colors">
                                Admin Login &rarr;
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
