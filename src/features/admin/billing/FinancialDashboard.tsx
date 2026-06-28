import { useState, useEffect } from 'react';
import { billingService } from '../../../services/billingService';
import { paymentService } from '../../../services/paymentService';
import { useToast } from '../../../contexts/ToastContext';
import { TrendingUp, DollarSign, Receipt, CreditCard, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function FinancialDashboard() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Get revenue stats for current month
            const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
            const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

            const revenueStats = await billingService.getRevenueStats(monthStart, monthEnd);
            const paymentStats = await paymentService.getPaymentStats(monthStart, monthEnd);

            setStats({
                revenue: revenueStats,
                payments: paymentStats,
            });

            // Generate revenue trend data for last 7 days
            const trendData = [];
            for (let i = 6; i >= 0; i--) {
                const date = subDays(new Date(), i);
                const dateStr = format(date, 'yyyy-MM-dd');

                // In a real app, you'd query for each day's data
                trendData.push({
                    date: format(date, 'MMM dd'),
                    revenue: Math.random() * 50000 + 20000, // Mock data
                    payments: Math.random() * 40000 + 15000, // Mock data
                });
            }
            setRevenueData(trendData);

            // Payment method distribution (mock data - backend stats to be implemented)
            setPaymentMethodData([
                { name: 'Cash', value: 25000, color: '#10b981' },
                { name: 'Card', value: 35000, color: '#3b82f6' },
                { name: 'UPI', value: 22000, color: '#f59e0b' },
                { name: 'Online', value: 18000, color: '#8b5cf6' },
            ]);

        } catch (error: any) {
            console.error('Error loading dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 mt-2">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const totalRevenue = stats?.revenue?.total_billed || 0;
    const totalCollected = stats?.revenue?.total_collected || 0;
    const totalPending = stats?.revenue?.total_pending || 0;
    const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
                </div>
                <p className="text-gray-600">Revenue analytics and financial insights</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                        <div className="flex items-center gap-1 text-green-600">
                            <ArrowUp className="w-4 h-4" />
                            <span className="text-sm font-semibold">12.5%</span>
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                    <p className="text-3xl font-bold text-blue-600">₹{totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <CreditCard className="w-8 h-8 text-green-600" />
                        <div className="flex items-center gap-1 text-green-600">
                            <ArrowUp className="w-4 h-4" />
                            <span className="text-sm font-semibold">8.2%</span>
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Collected</h3>
                    <p className="text-3xl font-bold text-green-600">₹{totalCollected.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{collectionRate.toFixed(1)}% collection rate</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <Receipt className="w-8 h-8 text-orange-600" />
                        <div className="flex items-center gap-1 text-red-600">
                            <ArrowDown className="w-4 h-4" />
                            <span className="text-sm font-semibold">5.1%</span>
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Pending</h3>
                    <p className="text-3xl font-bold text-orange-600">₹{totalPending.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Outstanding amount</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <Calendar className="w-8 h-8 text-purple-600" />
                        <div className="flex items-center gap-1 text-green-600">
                            <ArrowUp className="w-4 h-4" />
                            <span className="text-sm font-semibold">15.3%</span>
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Invoice</h3>
                    <p className="text-3xl font-bold text-purple-600">
                        ₹{stats?.revenue?.average_invoice || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Per transaction</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Trend */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                            <Line type="monotone" dataKey="payments" stroke="#10b981" strokeWidth={2} name="Collected" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Methods */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={paymentMethodData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {paymentMethodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        {paymentMethodData.map((method) => (
                            <div key={method.name} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: method.color }} />
                                <span className="text-sm text-gray-600">
                                    {method.name}: ₹{method.value.toFixed(0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                        { month: 'Jan', revenue: 125000, collected: 115000 },
                        { month: 'Feb', revenue: 142000, collected: 128000 },
                        { month: 'Mar', revenue: 138000, collected: 135000 },
                        { month: 'Apr', revenue: 156000, collected: 145000 },
                        { month: 'May', revenue: 167000, collected: 158000 },
                        { month: 'Jun', revenue: 178000, collected: 172000 },
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3b82f6" name="Billed" />
                        <Bar dataKey="collected" fill="#10b981" name="Collected" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
