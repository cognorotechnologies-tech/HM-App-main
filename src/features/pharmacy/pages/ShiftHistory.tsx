import React, { useState, useEffect } from 'react';
import { Clock, IndianRupee, User, Calendar, ExternalLink, ArrowRight, Download, Activity, CheckCircle2 } from 'lucide-react';
import api from '../../../lib/axios';

const ShiftHistory: React.FC = () => {
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchShifts = async () => {
        try {
            const res = await api.get('/pharmacy/shift/history');
            setShifts(res.data);
        } catch (err) {
            console.error("Error loading shift history", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Shift History</h1>
                    <p className="text-gray-500 font-medium">Audit logs of all pharmacy operational sessions</p>
                </div>
                <button
                    onClick={fetchShifts}
                    className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition text-blue-600"
                >
                    <Activity size={20} />
                </button>
            </header>

            <div className="space-y-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-3xl"></div>
                    ))
                ) : shifts.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <Clock className="mx-auto text-gray-200 mb-4" size={60} />
                        <p className="text-gray-400 font-black uppercase tracking-widest">No shift history found</p>
                    </div>
                ) : (
                    shifts.map((shift) => (
                        <div key={shift.shift_id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition group overflow-hidden">
                            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-50">
                                <div className="p-6 md:p-8 flex-1 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-lg">{shift.user_name || 'Pharmacist'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {shift.shift_id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${shift.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {shift.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Started At</p>
                                            <div className="flex items-center gap-2 font-bold text-gray-700">
                                                <Calendar size={14} className="text-gray-300" />
                                                <span className="text-sm">{new Date(shift.start_time).toLocaleDateString()}</span>
                                                <span className="text-orange-500">{new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ended At</p>
                                            <div className="flex items-center gap-2 font-bold text-gray-700">
                                                {shift.end_time ? (
                                                    <>
                                                        <CheckCircle2 size={14} className="text-green-400" />
                                                        <span className="text-sm">{new Date(shift.end_time).toLocaleDateString()}</span>
                                                        <span className="text-green-500">{new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-300 italic italic">Ongoing...</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1 hidden lg:block">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opening Bal</p>
                                            <p className="font-black text-lg text-gray-800">₹{parseFloat(shift.opening_cash).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 md:w-72 bg-gray-50/50 flex flex-col justify-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center md:text-left">Total Sales Value</p>
                                    <p className="text-4xl font-black text-blue-600 text-center md:text-left tracking-tighter">₹{parseFloat(shift.total_sales || 0).toLocaleString()}</p>
                                    <div className="mt-6 flex gap-3">
                                        <button className="flex-1 bg-white border border-gray-200 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition shadow-sm group-hover:bg-white">
                                            <Download size={14} /> Report
                                        </button>
                                        <button className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ShiftHistory;
