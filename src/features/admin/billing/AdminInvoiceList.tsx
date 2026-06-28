import { useState, useEffect } from 'react';
import { billingService, type BillingInvoice } from '../../../services/billingService';
import { useToast } from '../../../contexts/ToastContext';
import { Search, Filter, Download, Eye, DollarSign, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function AdminInvoiceList() {
    const toast = useToast();
    const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');

    useEffect(() => {
        loadInvoices();
    }, [statusFilter]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await billingService.getAllInvoices(
                statusFilter !== 'all' ? { status: statusFilter } : undefined
            );
            setInvoices(data);
        } catch (error: any) {
            console.error('Error loading invoices:', error);
            toast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const classes = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            partial: 'bg-orange-100 text-orange-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };

        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'overdue':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <DollarSign className="w-5 h-5 text-gray-600" />;
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());

        if (dateFilter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            return matchesSearch && invoice.issue_date.startsWith(today);
        }
        if (dateFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return matchesSearch && new Date(invoice.issue_date) >= weekAgo;
        }
        if (dateFilter === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return matchesSearch && new Date(invoice.issue_date) >= monthAgo;
        }

        return matchesSearch;
    });

    const stats = {
        total: invoices.length,
        pending: invoices.filter(i => i.payment_status === 'pending').length,
        paid: invoices.filter(i => i.payment_status === 'paid').length,
        overdue: invoices.filter(i => i.payment_status === 'overdue').length,
        totalAmount: invoices.reduce((sum, i) => sum + Number(i.total_amount), 0),
        paidAmount: invoices.reduce((sum, i) => sum + Number(i.paid_amount), 0),
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
                    <p className="text-gray-600 mt-1">View and manage all patient invoices</p>
                </div>
                <Link
                    to="/dashboard/admin/billing/generate"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <DollarSign className="w-5 h-5" />
                    Generate Invoice
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                        <h3 className="text-sm font-medium text-gray-600">Total Invoices</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-6 h-6 text-yellow-600" />
                        <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h3 className="text-sm font-medium text-gray-600">Paid</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <h3 className="text-sm font-medium text-gray-600">Overdue</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by invoice number..."
                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* Invoices Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 mt-2">Loading invoices...</p>
                </div>
            ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices Found</h3>
                    <p className="text-gray-600">Try adjusting your filters or create a new invoice</p>
                </div>
            ) : (
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Invoice #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Issue Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Paid
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(invoice.payment_status)}
                                                <span className="font-medium text-gray-900">{invoice.invoice_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            Patient ID: {invoice.patient_id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ₹{Number(invoice.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                            ₹{Number(invoice.paid_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                                            ₹{(Number(invoice.total_amount) - Number(invoice.paid_amount)).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(invoice.payment_status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="text-blue-600 hover:text-blue-700">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button className="text-gray-600 hover:text-gray-700">
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
