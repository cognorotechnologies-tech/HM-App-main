import React, { useState, useEffect } from 'react';
import { IndianRupee, Package, AlertTriangle, TrendingUp, Activity, FileText, Users, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [pendingPrescriptions, setPendingPrescriptions] = useState<any[]>([]);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await api.get('/pharmacy/prescriptions/pending');
                setPendingPrescriptions(res.data);
            } catch (err) {
                console.error("Failed to load prescriptions", err);
            }
        };
        fetchPending();

        // Poll every 15 seconds
        const interval = setInterval(fetchPending, 15000);
        return () => clearInterval(interval);
    }, [token]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pharmacy Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back, Pharmacist</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-xs text-blue-600 font-medium">Shift A</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                        P
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Today\'s Sales', value: '₹24,500', icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pending Prescriptions', value: pendingPrescriptions.length.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Low Stock Items', value: '12', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Expired Items', value: '5', icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.bg} ${stat.color}`}>+2.5%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mt-4">{stat.value}</h3>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Workflow Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Pending Prescriptions List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            Pending Prescriptions
                        </h2>
                        <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {pendingPrescriptions.length === 0 ? (
                            <p className="text-gray-500 italic">No pending prescriptions found.</p>
                        ) : (
                            pendingPrescriptions.slice(0, 5).map((rx) => (
                                <div key={rx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                            RX
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{rx.patient_name}</p>
                                            <p className="text-xs text-gray-500">Dr. {rx.doctor_name} • {new Date(rx.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                                            {rx.prescription_number}
                                        </span>
                                        <button
                                            onClick={() => navigate(`/pharmacy/billing?prescriptionId=${rx.id}`)}
                                            className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                                        >
                                            Dispense
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-purple-600" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/pharmacy/billing')}
                            className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition text-center group"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition">
                                <ShoppingCart className="text-purple-600" size={24} />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">New Bill</p>
                        </button>
                        <button
                            onClick={() => navigate('/pharmacy/purchases/new')}
                            className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-center group"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition">
                                <Package className="text-blue-600" size={24} />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Add Stock</p>
                        </button>
                        <button
                            onClick={() => navigate('/pharmacy/inventory')}
                            className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition text-center group"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition">
                                <Activity className="text-green-600" size={24} />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Check Expiry</p>
                        </button>
                        <button
                            onClick={() => navigate('/pharmacy/suppliers')}
                            className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition text-center group"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition">
                                <Users className="text-orange-600" size={24} />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Suppliers</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
