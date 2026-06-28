import React from 'react';
import { Home, ShoppingCart, Package, Users, FileText, Settings, LogOut, Pill, BarChart3, RotateCcw, History, Clock } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import ShiftManager from './ShiftManager';

const PharmacyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
        <Link
            to={to}
            className={`w-full flex items-center space-x-3 px-6 py-3 transition ${isActive(to) ? 'bg-blue-700 border-r-4 border-white' : 'hover:bg-blue-800'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen fixed left-0 top-0 shadow-2xl z-20">
                <div className="p-6 border-b border-blue-700">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg">
                            <Pill className="text-blue-900" size={28} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">PharmaCare</h1>
                            <p className="text-xs text-blue-300">Management System</p>
                        </div>
                    </div>
                </div>

                <nav className="mt-6 flex-1 overflow-y-auto custom-scrollbar pb-32">
                    <NavItem to="/pharmacy/dashboard" icon={Home} label="Dashboard" />
                    <NavItem to="/pharmacy/billing" icon={ShoppingCart} label="Billing" />
                    <NavItem to="/pharmacy/inventory" icon={Package} label="Inventory" />
                    <NavItem to="/pharmacy/medicines" icon={Pill} label="Medicines" />
                    <NavItem to="/pharmacy/purchases" icon={FileText} label="Purchases" />
                    <NavItem to="/pharmacy/suppliers" icon={Users} label="Suppliers" />
                    <NavItem to="/pharmacy/return" icon={RotateCcw} label="Returns" />
                    <NavItem to="/pharmacy/sales-history" icon={History} label="Sales History" />
                    <NavItem to="/pharmacy/shift-history" icon={Clock} label="Shift History" />
                    <NavItem to="/pharmacy/reports" icon={BarChart3} label="Reports" />
                </nav>

                <div className="absolute bottom-0 w-64 p-4 border-t border-blue-700 bg-blue-900">
                    <div className="mb-4">
                        <ShiftManager />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-blue-300 hover:text-white transition w-full text-left"
                    >
                        <LogOut size={18} />
                        <span className="text-sm">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PharmacyLayout;
