import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Menu, Search, Bell, HelpCircle, Calendar, Clock } from 'lucide-react';
import api from '../lib/axios';
import { patientService } from '../services/patientService';

export default function StaffHeader({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user, logout } = useAuthStore();
    const role = user?.role;
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTime] = useState(new Date());
    const [pendingAlertCount, setPendingAlertCount] = useState(0);

    // Search State
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleGlobalSearch = async (query: string) => {
        setIsSearching(true);
        setShowResults(true);
        try {
            // Search Patients
            const patients = await patientService.search(query).catch(() => []);
            setSearchResults(patients || []);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLogout = async () => {
        logout();
        navigate('/staff');
    };

    // Poll for alert count every 30 seconds
    useEffect(() => {
        const fetchAlertCount = async () => {
            try {
                // Refactored to use API
                const { data } = await api.get('/surveys/alerts/count', {
                    params: { status: 'open' }
                });
                setPendingAlertCount(data.count || 0);
            } catch (error) {
                console.error('Failed to fetch alert count:', error);
            }
        };

        fetchAlertCount();
        const interval = setInterval(fetchAlertCount, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Simple breadcrumb logic based on path
    const getPageTitle = () => {
        const path = location.pathname.split('/').pop();
        if (!path || path === role) return 'Dashboard';
        return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    };

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200/50 transition-all duration-300">
            <div className="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Left: Mobile Menu & Title/Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-xl md:hidden transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden md:flex flex-col">
                        <h1 className="text-xl font-bold text-gray-900 capitalize tracking-tight">
                            {getPageTitle()}
                        </h1>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                            <Calendar size={12} className="text-gray-400" />
                            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Center: Global Search (Hidden on small mobile) */}
                <div className="flex-1 max-w-xl px-8 hidden md:block relative z-50">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search patients (name/ID)..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm"
                            onChange={(e) => {
                                const query = e.target.value;
                                if (query.length > 2) {
                                    handleGlobalSearch(query);
                                } else {
                                    setSearchResults([]);
                                    setShowResults(false);
                                }
                            }}
                            onFocus={() => {
                                if (searchResults.length > 0) setShowResults(true);
                            }}
                            onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay to allow click
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5">⌘K</span>
                        </div>
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 mx-8 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-slideDown max-h-96 overflow-y-auto">
                            {isSearching ? (
                                <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                <ul>
                                    <li className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Patients
                                    </li>
                                    {searchResults.map((result) => (
                                        <li key={result.id}>
                                            <button
                                                onClick={() => {
                                                    // Navigate to consultation or profile
                                                    // For now, let's assume we want to go their timeline or profile.
                                                    // If we are a doctor, maybe straight to consultation if they have an active appointment? 
                                                    // But strictly speaking, profile is safer.
                                                    // Or check if there is an active appointment (logic for another day).
                                                    // Let's go to patient profile (which might be /dashboard/doctor/patient/:id or similar?)
                                                    // Based on PatientConsultation, routing seems to be /consultation/:appointmentId
                                                    // We might not have a direct "Patient Profile" page visible in my context, 
                                                    // but usually /patients/:id exists.
                                                    // Let's try navigating to a simplified timeline or check if we can find an active appointment.
                                                    navigate(`/dashboard/doctor/patients/${result.id}`);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {result.first_name[0]}{result.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{result.first_name} {result.last_name}</p>
                                                    <p className="text-xs text-gray-500">{result.phone || 'No phone'} • ID: ...{result.id.slice(-4)}</p>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
                        <Search size={20} />
                    </button>

                    <button
                        onClick={() => navigate('/dashboard/nurse/alerts')}
                        className="relative p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200 group"
                    >
                        <Bell size={20} />
                        {pendingAlertCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold animate-pulse">
                                {pendingAlertCount > 9 ? '9+' : pendingAlertCount}
                            </span>
                        )}
                    </button>

                    <button className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors hidden sm:block">
                        <HelpCircle size={20} />
                    </button>

                    {/* Role Badge (Minimal) */}
                    <div className="px-3 py-1.5 bg-gray-100/50 rounded-lg border border-gray-200 hidden sm:flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-purple-500' :
                            role === 'doctor' ? 'bg-blue-500' :
                                role === 'nurse' ? 'bg-pink-500' : 'bg-gray-500'
                            }`}></div>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {role}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}

