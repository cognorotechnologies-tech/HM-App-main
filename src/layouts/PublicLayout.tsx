import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function PublicLayout() {
    const { user, logout } = useAuthStore();

    const navigation = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Departments', path: '/departments' },
        { name: 'Doctors', path: '/doctors' },
        { name: 'Services', path: '/services' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Resources', path: '/resources' },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xl font-bold">H+</span>
                            </div>
                            <span className="hidden sm:block text-xl font-bold text-gray-900">
                                Medicare Hospital
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="text-gray-700 hover:text-blue-600 text-sm font-medium"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        className="text-gray-700 hover:text-blue-600 text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Patient Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* About */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">MediCare Hospital</h3>
                            <p className="text-gray-400 text-sm">
                                Providing quality healthcare services with compassion and excellence since 1990.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><Link to="/about" className="text-gray-400 hover:text-white text-sm">About Us</Link></li>
                                <li><Link to="/departments" className="text-gray-400 hover:text-white text-sm">Departments</Link></li>
                                <li><Link to="/doctors" className="text-gray-400 hover:text-white text-sm">Our Doctors</Link></li>
                                <li><Link to="/services" className="text-gray-400 hover:text-white text-sm">Services</Link></li>
                                <li><Link to="/testing" className="text-gray-400 hover:text-white text-sm">Testing Portal</Link></li>
                                <li><Link to="/showcase" className="text-gray-400 hover:text-white text-sm">Product Showcase</Link></li>
                                <li><Link to="/detailed-report" className="text-gray-400 hover:text-white text-sm">Detailed Report</Link></li>
                                <li><Link to="/executive-summary" className="text-gray-400 hover:text-white text-sm">Executive Summary</Link></li>
                                <li><Link to="/staff" className="text-gray-400 hover:text-white text-sm">Staff Portals</Link></li>
                            </ul>
                        </div>

                        {/* Patient Resources */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">For Patients</h3>
                            <ul className="space-y-2">
                                <li><Link to="/login" className="text-gray-400 hover:text-white text-sm">Book Appointment</Link></li>
                                <li><Link to="/resources" className="text-gray-400 hover:text-white text-sm">Patient Resources</Link></li>
                                <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm">Contact Us</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>📍 123 Health Street, Medical City</li>
                                <li>📞 Emergency: +1 (234) 567-8900</li>
                                <li>📧 info@medicarehospital.com</li>
                                <li>🕐 24/7 Emergency Services</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 MediCare Hospital. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link to="/staff" className="text-gray-500 hover:text-gray-400 text-xs">
                                Staff Portal
                            </Link>
                            <a href="#" className="text-gray-500 hover:text-gray-400 text-xs">Privacy Policy</a>
                            <a href="#" className="text-gray-500 hover:text-gray-400 text-xs">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
