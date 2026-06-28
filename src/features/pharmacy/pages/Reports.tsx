import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, PieChart, Calendar } from 'lucide-react';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';

const Reports: React.FC = () => {
    const { token } = useAuthStore();
    const [dailySales, setDailySales] = useState<any>(null);
    const [topMedicines, setTopMedicines] = useState<any[]>([]);
    const [valuation, setValuation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [salesRes, topRes, valRes] = await Promise.all([
                    api.get('/pharmacy/analytics/daily-sales'),
                    api.get('/pharmacy/analytics/top-medicines'),
                    api.get('/pharmacy/analytics/valuation')
                ]);

                setDailySales(salesRes.data);
                setTopMedicines(topRes.data);
                setValuation(valRes.data);
            } catch (err) {
                console.error("Error loading reports", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    if (loading) return <div className="p-8">Loading analytics...</div>;

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Pharmacy Analytics</h1>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold uppercase">Today's Revenue</p>
                            <h2 className="text-3xl font-bold text-gray-800 mt-2">₹{parseFloat(dailySales?.total_revenue || 0).toLocaleString()}</h2>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold uppercase">Inventory Value (MRP)</p>
                            <h2 className="text-3xl font-bold text-gray-800 mt-2">₹{parseFloat(valuation?.total_sales_value || 0).toLocaleString()}</h2>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2 font-medium">Potential profit: ₹{(valuation?.total_sales_value - valuation?.total_purchase_value).toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-semibold uppercase">Bills Generated</p>
                            <h2 className="text-3xl font-bold text-gray-800 mt-2">{dailySales?.total_bills || 0}</h2>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <Calendar size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Medicines */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="text-blue-600" />
                        Top Performing Products
                    </h3>
                    <div className="space-y-4">
                        {topMedicines.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-gray-400">#{idx + 1}</span>
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.medicine_name}</p>
                                        <p className="text-xs text-gray-500">{item.total_quantity_sold} units sold</p>
                                    </div>
                                </div>
                                <span className="font-bold text-blue-600">₹{parseFloat(item.total_revenue).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <PieChart className="text-orange-600" />
                        Payment Mode Breakdown
                    </h3>
                    <div className="space-y-6">
                        {['Cash', 'Card', 'UPI'].map((mode) => {
                            const val = dailySales?.[`${mode.toLowerCase()}_sales`] || 0;
                            const total = dailySales?.total_revenue || 1;
                            const pct = ((val / total) * 100).toFixed(1);

                            return (
                                <div key={mode}>
                                    <div className="flex justify-between text-sm font-semibold mb-1">
                                        <span>{mode}</span>
                                        <span className="text-gray-600">₹{parseFloat(val).toLocaleString()} ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
