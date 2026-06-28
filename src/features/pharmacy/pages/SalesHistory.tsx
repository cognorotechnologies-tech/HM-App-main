import React, { useState, useEffect } from 'react';
import { Search, Calendar, FileText, ChevronRight, Download, Printer, Filter, X } from 'lucide-react';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';

const SalesHistory: React.FC = () => {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBill, setSelectedBill] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchBills = async () => {
        setLoading(true);
        try {
            const params: any = {
                billNumber: searchTerm || undefined,
                startDate: dateRange.start || undefined,
                endDate: dateRange.end || undefined,
                limit: 50
            };
            const res = await api.get('/pharmacy/bills', { params });
            setBills(res.data);
        } catch (err) {
            console.error("Error fetching sales history", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, [searchTerm, dateRange]);

    const viewBillDetails = async (billId: string) => {
        try {
            const res = await api.get(`/pharmacy/bills/${billId}`);
            setSelectedBill(res.data);
        } catch (err) {
            console.error("Error loading bill details", err);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Sales History</h1>
                    <p className="text-gray-500 text-sm font-medium">Browse and search past pharmacy transactions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Invoice #..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2.5 rounded-xl border transition flex items-center gap-2 font-bold text-sm ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                    <button onClick={fetchBills} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition shadow-sm">
                        <Download size={18} />
                    </button>
                </div>
            </header>

            {showFilters && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none transition"
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-500 outline-none transition"
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setDateRange({ start: '', end: '' })}
                            className="text-red-500 text-sm font-bold hover:underline mb-2"
                        >
                            Reset Dates
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient / Customer</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4 h-16 bg-gray-50/50"></td>
                                    </tr>
                                ))
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No transactions found</td>
                                </tr>
                            ) : (
                                bills.map((bill) => (
                                    <tr key={bill.bill_id} className="hover:bg-blue-50/30 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs">INV</div>
                                                <span className="font-black text-gray-800 text-sm tracking-tighter">{bill.bill_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-800 text-sm">{bill.patient_name || bill.customer_name || 'Anonymous'}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{bill.bill_type}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-600 text-xs">{new Date(bill.created_at).toLocaleDateString()} {new Date(bill.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${bill.payment_mode === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {bill.payment_mode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-gray-800 text-lg">₹{Math.round(bill.net_amount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => viewBillDetails(bill.bill_id)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition hover:bg-blue-50 rounded-xl"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bill Details Modal */}
            {selectedBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">
                        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest">Invoice Details</h3>
                                <p className="text-blue-200 text-xs font-bold">INV: {selectedBill.bill_number}</p>
                            </div>
                            <button onClick={() => setSelectedBill(null)} className="p-2 hover:bg-blue-500 rounded-xl transition text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                                    <p className="font-bold text-gray-800 text-lg">{selectedBill.patient_name || selectedBill.customer_name || 'Walk-in'}</p>
                                    <p className="text-sm text-gray-500">{selectedBill.customer_phone || 'No phone'}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill Date</p>
                                    <p className="font-bold text-gray-800">{new Date(selectedBill.created_at).toLocaleString()}</p>
                                    <p className="text-sm font-black text-blue-600 uppercase tracking-widest">{selectedBill.payment_mode}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Medicine Detail</p>
                                <div className="space-y-3">
                                    {selectedBill.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                            <div>
                                                <p className="font-black text-gray-800 underline decoration-blue-200 underline-offset-4">{item.medicine_name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Batch: {item.batch_number} • Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-black text-gray-800">₹{parseFloat(item.total_amount).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100 space-y-3">
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₹{parseFloat(selectedBill.subtotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span>Tax (GST)</span>
                                    <span>₹{parseFloat(selectedBill.tax_amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center bg-blue-50 p-6 rounded-3xl mt-4">
                                    <span className="text-lg font-black text-blue-900 uppercase tracking-widest">Amount Paid</span>
                                    <span className="text-4xl font-black text-blue-700">₹{Math.round(selectedBill.net_amount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                            <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm">
                                <Printer size={18} /> Print Record
                            </button>
                            <button className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200" onClick={() => setSelectedBill(null)}>
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesHistory;
