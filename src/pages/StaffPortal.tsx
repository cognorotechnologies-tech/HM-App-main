import { Link } from 'react-router-dom';

export default function StaffPortal() {
    const portals = [
        {
            title: 'Doctor Portal',
            description: 'Access your schedule, appointments, and patient consultations',
            path: '/staff/doctor',
            icon: '👨‍⚕️',
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'hover:from-blue-600 hover:to-blue-700'
        },
        {
            title: 'Admin Portal',
            description: 'Manage hospital operations, staff, and system settings',
            path: '/staff/admin',
            icon: '⚙️',
            color: 'from-purple-500 to-purple-600',
            hoverColor: 'hover:from-purple-600 hover:to-purple-700'
        },
        {
            title: 'Receptionist Portal',
            description: 'Register patients, manage queue, and handle walk-ins',
            path: '/staff/receptionist',
            icon: '🏥',
            color: 'from-teal-500 to-teal-600',
            hoverColor: 'hover:from-teal-600 hover:to-teal-700'
        },
        {
            title: 'Pharmacist Portal',
            description: 'Manage medicine inventory, billing and sales',
            path: '/staff/pharmacist',
            icon: '💊',
            color: 'from-blue-700 to-blue-900',
            hoverColor: 'hover:from-blue-800 hover:to-blue-900'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Staff Portal
                    </h1>
                    <p className="text-lg text-gray-600">
                        Secure access for hospital staff members
                    </p>
                    <div className="mt-4">
                        <Link
                            to="/"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            ← Back to Public Website
                        </Link>
                    </div>
                </div>

                {/* Portal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {portals.map((portal) => (
                        <Link
                            key={portal.path}
                            to={portal.path}
                            className="group"
                        >
                            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                                {/* Icon Section */}
                                <div className={`bg-gradient-to-r ${portal.color} ${portal.hoverColor} p-8 text-center transition-all duration-300`}>
                                    <div className="text-6xl mb-4">{portal.icon}</div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {portal.title}
                                    </h2>
                                </div>

                                {/* Content Section */}
                                <div className="p-6">
                                    <p className="text-gray-600 text-center mb-4">
                                        {portal.description}
                                    </p>
                                    <div className="text-center">
                                        <span className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-800">
                                            Login
                                            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Security Notice */}
                <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <svg className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="ml-3">
                            <h3 className="text-sm font-semibold text-amber-800">
                                Authorized Access Only
                            </h3>
                            <p className="text-sm text-amber-700 mt-1">
                                This portal is for authorized hospital staff only. All access is logged and monitored.
                                If you are a patient, please use the <Link to="/login" className="underline font-semibold">patient portal</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
