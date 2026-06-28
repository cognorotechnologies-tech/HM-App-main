import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Calendar, Package } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';

const GRNEntry: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const [po, setPo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [grnItems, setGrnItems] = useState<any[]>([]);

    // Invoice Details
    const [invoiceNo, setInvoiceNo] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (id) fetchPO();
    }, [id]);

    const fetchPO = async () => {
        try {
            const res = await api.get(`/pharmacy/orders/${id}`);
            setPo(res.data);

            // Initialize GRN items from PO items
            const initialItems = res.data.items.map((item: any) => ({
                medicine_id: item.medicine_id,
                medicine_name: item.medicine_name, // from join
                quantity_ordered: item.quantity_ordered,
                quantity_received: item.quantity_ordered,
                free_quantity: 0,
                purchase_price: item.unit_price,
                mrp: item.unit_price * 1.5, // Default suggestion
                selling_price: item.unit_price * 1.4, // Default suggestion
                batch_number: '',
                expiry_date: '',
                tax_percentage: item.tax_percentage
            }));
            setGrnItems(initialItems);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching PO:', error);
            setLoading(false);
        }
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...grnItems];
        newItems[index][field] = value;
        setGrnItems(newItems);
    };

    const handleSubmit = async () => {
        // Validation
        if (!invoiceNo) {
            alert('Please enter Invoice Number');
            return;
        }
        const invalidItems = grnItems.filter(item => !item.batch_number || !item.expiry_date);
        if (invalidItems.length > 0) {
            alert('All items must have Batch Number and Expiry Date');
            return;
        }

        const payload = {
            po_id: po.po_id,
            supplier_id: po.supplier_id,
            invoice_number: invoiceNo,
            invoice_date: invoiceDate,
            received_date: receivedDate,
            items: grnItems
        };

        try {
            await api.post('/pharmacy/grn', payload);
            alert('Goods received successfully! Stock has been updated.');
            navigate('/pharmacy/inventory');
        } catch (error) {
            console.error('Error creating GRN:', error);
            alert('Failed to process GRN');
        }
    };

    if (loading) return <div className="p-8">Loading Purchase Order...</div>;
    if (!po) return <div className="p-8">Purchase Order Not Found</div>;

    const totalAmount = grnItems.reduce((sum, item) => sum + (item.quantity_received * item.purchase_price), 0);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Receive Goods (GRN)</h1>
                    <p className="text-sm text-gray-500">Against PO: <span className="font-mono text-blue-600">{po.po_number}</span></p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-4 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Supplier</label>
                    <p className="text-gray-800 font-medium">{po.supplier_name}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                        placeholder="Enter Supplier Invoice No"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                    <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
                    <input
                        type="date"
                        className="w-full p-2 border rounded"
                        value={receivedDate}
                        onChange={(e) => setReceivedDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto mb-6">
                <table className="w-full min-w-[1000px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-48">Item</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-24">Rec Qty</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-24">Free Qty</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-32">Batch No *</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-32">Expiry *</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-28">Pur. Price</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-28">MRP</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase w-28">Sell Price</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {grnItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <p className="text-sm font-medium text-gray-800">{item.medicine_name}</p>
                                    <p className="text-xs text-gray-500">Ord: {item.quantity_ordered}</p>
                                </td>
                                <td className="p-2">
                                    <input type="number" className="w-full p-1 border rounded text-sm" value={item.quantity_received} onChange={(e) => updateItem(idx, 'quantity_received', parseFloat(e.target.value))} />
                                </td>
                                <td className="p-2">
                                    <input type="number" className="w-full p-1 border rounded text-sm" value={item.free_quantity} onChange={(e) => updateItem(idx, 'free_quantity', parseFloat(e.target.value))} />
                                </td>
                                <td className="p-2">
                                    <input className="w-full p-1 border rounded text-sm font-medium text-blue-700" value={item.batch_number} onChange={(e) => updateItem(idx, 'batch_number', e.target.value)} placeholder="BATCH-001" />
                                </td>
                                <td className="p-2">
                                    <input type="date" className="w-full p-1 border rounded text-sm" value={item.expiry_date} onChange={(e) => updateItem(idx, 'expiry_date', e.target.value)} />
                                </td>
                                <td className="p-2">
                                    <input type="number" className="w-full p-1 border rounded text-sm" value={item.purchase_price} onChange={(e) => updateItem(idx, 'purchase_price', parseFloat(e.target.value))} />
                                </td>
                                <td className="p-2">
                                    <input type="number" className="w-full p-1 border rounded text-sm" value={item.mrp} onChange={(e) => updateItem(idx, 'mrp', parseFloat(e.target.value))} />
                                </td>
                                <td className="p-2">
                                    <input type="number" className="w-full p-1 border rounded text-sm" value={item.selling_price} onChange={(e) => updateItem(idx, 'selling_price', parseFloat(e.target.value))} />
                                </td>
                                <td className="p-4 text-right font-bold text-gray-700">
                                    ₹{(item.quantity_received * item.purchase_price).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-xl">
                <div>
                    <p className="text-sm text-gray-500">Total Purchase Value</p>
                    <p className="text-2xl font-bold text-gray-800">₹{totalAmount.toFixed(2)}</p>
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2 font-bold"
                >
                    <Package size={20} />
                    Confirm & Add Stock
                </button>
            </div>
        </div>
    );
};

export default GRNEntry;
