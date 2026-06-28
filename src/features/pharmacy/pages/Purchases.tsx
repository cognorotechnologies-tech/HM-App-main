import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';

const Purchases: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { token } = useAuthStore();

    useEffect(() => {
        fetchOrders();
    }, [searchTerm]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/pharmacy/orders', {
                params: { search: searchTerm }
            });
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><CheckCircle size={12} /> Received</span>;
            case 'approved': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
            case 'pending': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><Clock size={12} /> Pending</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><XCircle size={12} /> Cancelled</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{status}</span>;
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
                    <p className="text-sm text-gray-500">Manage procurement and supplier orders</p>
                </div>
                <button
                    onClick={() => navigate('/pharmacy/purchases/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} />
                    Create PO
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by PO Number or Supplier..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">PO Number</th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Created By</th>
                            <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading orders...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-500">No purchase orders found.</td></tr>
                        ) : (
                            orders.map((po) => (
                                <tr key={po.po_id} className="hover:bg-gray-50 transition">
                                    <td className="py-4 px-6 text-sm font-medium text-blue-600">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} />
                                            {po.po_number}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600">
                                        {new Date(po.po_date).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-800">{po.supplier_name}</td>
                                    <td className="py-4 px-6 text-sm font-bold text-gray-800">₹{parseFloat(po.net_amount).toFixed(2)}</td>
                                    <td className="py-4 px-6 text-sm">{getStatusBadge(po.status)}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500">{po.created_by_name || 'System'}</td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => navigate(`/pharmacy/purchases/${po.po_id}`)}
                                            className="text-gray-400 hover:text-blue-600 transition"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Purchases;
