import { Link, Outlet } from 'react-router-dom';

export default function StaffAuthLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">
                            H+
                        </div>
                        <span className="font-bold text-gray-900 text-lg">
                            MediCare <span className="text-gray-500 font-normal">Staff Portal</span>
                        </span>
                    </Link>
                    <Link to="/" className="text-sm text-gray-500 hover:text-blue-600">
                        &larr; Back to Hospital Home
                    </Link>
                </div>
            </header>

            {/* Main Content (Login Forms) */}
            <main className="flex-1 flex items-center justify-center p-4">
                <Outlet />
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} MediCare Hospital. Authorized Personnel Only.</p>
            </footer>
        </div>
    );
}
