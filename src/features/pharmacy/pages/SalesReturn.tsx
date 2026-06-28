import React, { useState } from 'react';
import { Search, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { pharmacyService } from '../../../services/pharmacyService';
import { useAuthStore } from '../../../store/authStore';

const SalesReturn: React.FC = () => {
    const { token } = useAuthStore();
    const [billId, setBillId] = useState('');
    const [billData, setBillData] = useState<any>(null);
    const [returnItems, setReturnItems] = useState<{ [key: string]: number }>({});
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState<string | null>(null);

    const searchBill = async () => {
        try {
            const data = await pharmacyService.getSalesBillById(billId);
            if (data) {
                setBillData(data);
                setStatus(null);
            } else {
                setStatus('Bill not found');
                setBillData(null);
            }
        } catch (err) {
            setStatus('Error searching bill');
            setBillData(null);
        }
    };

    const handleQuantityChange = (itemId: string, max: number, val: number) => {
        if (val < 0) return;
        if (val > max) return;
        setReturnItems(prev => ({
            ...prev,
            [itemId]: val
        }));
    };

    const processReturn = async () => {
        if (!billData) {
            setStatus('No bill data available');
            return;
        }

        const itemsToReturn = billData.items
            .filter((item: any) => (returnItems[item.sale_item_id] || 0) > 0)
            .map((item: any) => ({
                medicine_id: item.medicine_id,
                batch_number: item.batch_number,
                quantity: returnItems[item.sale_item_id],
                unit_price: item.unit_price
            }));

        if (itemsToReturn.length === 0) {
            setStatus('Please select items to return');
            return;
        }

        try {
            await pharmacyService.processSalesReturn({
                originalBillId: billData.bill_id,
                returnItems: itemsToReturn,
                reason,
                refundMode: 'Cash'
            });

            setStatus('Return processed successfully!');
            setBillData(null);
            setBillId('');
            setReturnItems({});
            setReason('');
        } catch (err: any) {
            setStatus('Failed to process return: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <RotateCcw className="text-red-600" />
                Sales Return / Refund
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter Bill Number (e.g., INV-2309-001)"
                        className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2"
                        value={billId}
                        onChange={(e) => setBillId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchBill()}
                    />
                    <button
                        onClick={searchBill}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md active:scale-95"
                    >
                        Search Bill
                    </button>
                </div>
                {status && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${status.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {status.includes('success') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <p className="font-medium text-sm">{status}</p>
                    </div>
                )}
            </div>

            {billData && (
                <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in space-y-6">
                    <div className="flex justify-between border-b border-gray-100 pb-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Name</p>
                            <p className="font-bold text-gray-800">{billData.customer_name || billData.patient_name || 'Walk-in Customer'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill Date</p>
                            <p className="font-bold text-gray-800">{billData.created_at ? new Date(billData.created_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertCircle size={16} className="text-orange-500" />
                            Select Items to Return
                        </h3>
                        <div className="space-y-3">
                            {billData.items?.map((item: any) => (
                                <div key={item.sale_item_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition hover:bg-gray-100/50">
                                    <div>
                                        <p className="font-black text-gray-800 underline decoration-blue-200 underline-offset-4">{item.medicine_name}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                                            Batch: {item.batch_number} | Purchased: <span className="text-gray-800">{item.quantity}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => handleQuantityChange(item.sale_item_id, item.quantity, (returnItems[item.sale_item_id] || 0) - 1)}
                                                className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold"
                                            >-</button>
                                            <input
                                                type="number"
                                                className="w-12 text-center py-1 font-black text-blue-600 focus:outline-none"
                                                min="0"
                                                max={item.quantity}
                                                value={returnItems[item.sale_item_id] || 0}
                                                onChange={(e) => handleQuantityChange(item.sale_item_id, item.quantity, parseInt(e.target.value) || 0)}
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(item.sale_item_id, item.quantity, (returnItems[item.sale_item_id] || 0) + 1)}
                                                className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold"
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Reason for Return</label>
                        <textarea
                            className="w-full border-2 border-gray-100 rounded-xl p-4 focus:border-blue-500 outline-none transition bg-gray-50/50"
                            placeholder="e.g., Wrong medicine, Damaged, Customer request..."
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={processReturn}
                        className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 flex justify-center items-center gap-3 transition shadow-lg shadow-red-200 active:scale-[0.98]"
                    >
                        <RotateCcw size={20} />
                        Confirm Refund & Restock
                    </button>
                </div>
            )}
        </div>
    );
};

export default SalesReturn;
