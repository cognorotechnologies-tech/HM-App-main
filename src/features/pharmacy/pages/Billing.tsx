import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, ShoppingCart, Minus, CreditCard, DollarSign, Check, Printer, Trash2, FileText, User, UserPlus, Activity, AlertCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';
import { useShift } from '../context/ShiftContext';

const Billing: React.FC = () => {
    const { currentShift } = useShift();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { token, user } = useAuthStore();

    // Bill Header State
    const [patient, setPatient] = useState<any>(null);
    const [doctor, setDoctor] = useState<any>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [billType, setBillType] = useState('Walk-in'); // Walk-in, Patient, Insurance

    // Search States
    const [ptSearch, setPtSearch] = useState('');
    const [ptResults, setPtResults] = useState<any[]>([]);
    const [drSearch, setDrSearch] = useState('');
    const [drResults, setDrResults] = useState<any[]>([]);

    // Medicine Search
    const [medSearch, setMedSearch] = useState('');
    const [medResults, setMedResults] = useState<any[]>([]);
    const [loadingMed, setLoadingMed] = useState(false);

    // Bill Items
    const [billItems, setBillItems] = useState<any[]>([]);

    // UI States
    const [showPtSearch, setShowPtSearch] = useState(false);
    const [showDrSearch, setShowDrSearch] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successBill, setSuccessBill] = useState<any>(null);

    // Refs for clicking outside
    const ptRef = useRef<HTMLDivElement>(null);
    const drRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prescriptionId = searchParams.get('prescriptionId');
        if (prescriptionId) {
            fetchPrescription(prescriptionId);
        }
    }, [searchParams]);

    useEffect(() => {
        if (ptSearch.length > 2) searchPatients();
        else setPtResults([]);
    }, [ptSearch]);

    useEffect(() => {
        if (drSearch.length > 2) searchDoctors();
        else setDrResults([]);
    }, [drSearch]);

    useEffect(() => {
        if (medSearch.length > 2) searchInventory();
        else setMedResults([]);
    }, [medSearch]);

    const searchPatients = async () => {
        try {
            const res = await api.get('/patients', { params: { query: ptSearch } });
            setPtResults(res.data);
        } catch (err) { console.error(err); }
    };

    const searchDoctors = async () => {
        try {
            const res = await api.get('/doctors', { params: { query: drSearch } });
            setDrResults(res.data);
        } catch (err) { console.error(err); }
    };

    const searchInventory = async () => {
        setLoadingMed(true);
        try {
            const res = await api.get('/pharmacy/inventory', { params: { search: medSearch } });
            setMedResults(res.data);
        } catch (err) { console.error(err); }
        finally { setLoadingMed(false); }
    };

    const fetchPrescription = async (id: string) => {
        try {
            const res = await api.get(`/pharmacy/prescriptions/${id}`);
            const rx = res.data;
            setPatient({ id: rx.patient_id, name: rx.patient_name });
            setCustomerName(rx.patient_name);
            setBillType('Patient');

            // Note: In a real system, we'd attempt to auto-match prescription items to inventory batches
            // For now, we let user search and add based on suggestion
        } catch (error) { console.error(error); }
    };

    const addToBill = (inventoryItem: any) => {
        const existing = billItems.find(item => item.stock_id === inventoryItem.stock_id);
        if (existing) {
            if (existing.quantity + 1 > inventoryItem.quantity_available) {
                alert('Not enough stock available!');
                return;
            }
            setBillItems(billItems.map(item =>
                item.stock_id === inventoryItem.stock_id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setBillItems([...billItems, {
                stock_id: inventoryItem.stock_id,
                medicine_id: inventoryItem.medicine_id,
                name: inventoryItem.medicine_name,
                batch: inventoryItem.batch_number,
                mrp: inventoryItem.selling_price,
                quantity: 1,
                maxStock: inventoryItem.quantity_available,
                tax_percentage: inventoryItem.tax_percentage || 12
            }]);
        }
        setMedSearch('');
    };

    const updateQty = (invId: string, val: number) => {
        setBillItems(billItems.map(item => {
            if (item.stock_id === invId) {
                const newQty = Math.max(0, item.quantity + val);
                if (newQty > item.maxStock) {
                    alert('Cannot exceed available stock!');
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const totals = billItems.reduce((acc, item) => {
        const itemSubtotal = item.mrp * item.quantity;
        const itemTax = itemSubtotal * (item.tax_percentage / 100);
        return {
            subtotal: acc.subtotal + itemSubtotal,
            tax: acc.tax + itemTax,
            total: acc.total + itemSubtotal + itemTax
        };
    }, { subtotal: 0, tax: 0, total: 0 });

    const handleCheckout = async (mode: string) => {
        if (!currentShift) {
            alert('Please open a shift first!');
            return;
        }
        if (billItems.length === 0) {
            alert('Add at least one item');
            return;
        }

        setIsProcessing(true);
        const payload = {
            patient_id: patient?.id,
            customer_name: customerName || (patient ? `${patient.first_name} ${patient.last_name || ''}` : 'Walk-in'),
            customer_phone: customerPhone,
            bill_type: billType,
            payment_mode: mode,
            payment_status: 'Paid',
            items: billItems.map(item => ({
                medicine_id: item.medicine_id,
                batch_number: item.batch,
                quantity: item.quantity,
                unit_price: item.mrp,
                tax_percentage: item.tax_percentage
            })),
            subtotal: totals.subtotal,
            tax_amount: totals.tax,
            net_amount: totals.total
        };

        try {
            const res = await api.post('/pharmacy/bills', payload);
            setSuccessBill(res.data);
            setBillItems([]);
            setPatient(null);
            setDoctor(null);
            setCustomerName('');
            setCustomerPhone('');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to process bill');
        } finally {
            setIsProcessing(false);
        }
    };

    if (successBill) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-green-100 max-w-md w-full text-center animate-fadeIn">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 mb-2">Transaction Success!</h2>
                    <p className="text-gray-500 mb-6">Bill No: <span className="font-mono font-bold text-blue-600">{successBill.bill_number}</span></p>

                    <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left space-y-2">
                        <div className="flex justify-between text-sm"><span>Net Amount:</span><span className="font-bold">₹{parseFloat(successBill.net_amount).toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span>Mode:</span><span className="font-medium">{successBill.payment_mode}</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                            <Printer size={18} /> Print
                        </button>
                        <button onClick={() => setSuccessBill(null)} className="flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition">
                            New Bill
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-6 p-6 overflow-hidden">
            {/* Left Column: Input and Search */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                {/* Patient & Doctor Selector */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Transaction Header</h3>
                        <div className="flex gap-2">
                            {['Walk-in', 'Patient', 'Insurance'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setBillType(type)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${billType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Patient Search */}
                        <div className="relative" ref={ptRef}>
                            <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">Patient Details</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition" size={18} />
                                <input
                                    type="text"
                                    placeholder={patient ? `${patient.profiles?.first_name} ${patient.profiles?.last_name || ''}` : "Search Patient..."}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition font-medium"
                                    value={ptSearch}
                                    onChange={(e) => { setPtSearch(e.target.value); setShowPtSearch(true); }}
                                    onFocus={() => setShowPtSearch(true)}
                                />
                                {patient && (
                                    <button onClick={() => setPatient(null)} className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                )}
                            </div>
                            {showPtSearch && ptResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto animate-scaleIn">
                                    {ptResults.map(p => (
                                        <div
                                            key={p.id}
                                            className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition"
                                            onClick={() => { setPatient(p); setCustomerName(`${p.profiles.first_name} ${p.profiles.last_name || ''}`); setCustomerPhone(p.profiles.phone || ''); setPtSearch(''); setShowPtSearch(false); }}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">{p.profiles.first_name[0]}</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{p.profiles.first_name} {p.profiles.last_name}</p>
                                                <p className="text-xs text-gray-500">{p.profiles.phone || 'No Phone'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Doctor Search */}
                        <div className="relative" ref={drRef}>
                            <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">Prescribing Doctor</label>
                            <div className="relative group">
                                <UserPlus className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-purple-500 transition" size={18} />
                                <input
                                    type="text"
                                    placeholder={doctor ? `Dr. ${doctor.profiles?.first_name}` : "Search Doctor..."}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl outline-none transition font-medium"
                                    value={drSearch}
                                    onChange={(e) => { setDrSearch(e.target.value); setShowDrSearch(true); }}
                                    onFocus={() => setShowDrSearch(true)}
                                />
                            </div>
                            {showDrSearch && drResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-48 overflow-y-auto animate-scaleIn">
                                    {drResults.map(d => (
                                        <div
                                            key={d.id}
                                            className="p-3 hover:bg-purple-50 cursor-pointer flex items-center gap-3 transition"
                                            onClick={() => { setDoctor(d); setDrSearch(''); setShowDrSearch(false); }}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs uppercase">{d.profiles.first_name[0]}</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">Dr. {d.profiles.first_name} {d.profiles.last_name}</p>
                                                <p className="text-xs text-gray-500">{d.departments?.name || 'General'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Medicine Search */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Inventory Search</h3>
                    <div className="relative">
                        <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Type medicine name (min 3 chars)..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl outline-none transition font-semibold text-lg"
                            value={medSearch}
                            onChange={(e) => setMedSearch(e.target.value)}
                        />
                        {loadingMed && (
                            <div className="absolute right-4 top-4">
                                <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {medResults.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                            {medResults.map(med => (
                                <div
                                    key={med.stock_id}
                                    onClick={() => addToBill(med)}
                                    className="p-4 bg-gray-50 rounded-2xl hover:bg-green-50 border-2 border-transparent hover:border-green-200 cursor-pointer transition group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-black text-gray-800 group-hover:text-green-800">{med.medicine_name}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase">Batch: {med.batch_number}</span>
                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-black uppercase">Exp: {new Date(med.expiry_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-blue-600">₹{med.selling_price}</p>
                                            <p className={`text-[10px] font-bold ${med.quantity_available < 10 ? 'text-red-500' : 'text-gray-400'}`}>Stock: {med.quantity_available}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bill Items List */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Billing Basket</h3>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black">{billItems.length} ITEMS</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {billItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                                <ShoppingCart size={80} />
                                <p className="font-black text-xl mt-4">Basket is empty</p>
                            </div>
                        ) : (
                            billItems.map(item => (
                                <div key={item.stock_id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-3xl hover:shadow-md transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{item.name}</p>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">Batch: {item.batch}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">Price: ₹{item.mrp}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl">
                                            <button onClick={() => updateQty(item.stock_id, -1)} className="w-8 h-8 rounded-xl hover:bg-white text-gray-400 hover:text-gray-800 flex items-center justify-center transition"><Minus size={16} /></button>
                                            <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.stock_id, 1)} className="w-8 h-8 rounded-xl hover:bg-white text-gray-400 hover:text-gray-800 flex items-center justify-center transition"><Plus size={16} /></button>
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <p className="text-xl font-black text-gray-800">₹{(item.mrp * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <button onClick={() => updateQty(item.stock_id, -item.quantity)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={20} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Calculations and Payment */}
            <div className="w-96 flex flex-col gap-6">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden">
                    <div className="p-8 bg-blue-600 text-white">
                        <p className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1">Grand Total</p>
                        <h2 className="text-5xl font-black leading-tight">₹{totals.total.toFixed(0)}<span className="text-2xl font-normal opacity-50">.{(totals.total % 1).toFixed(2).substring(2)}</span></h2>
                    </div>

                    <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                        {/* Summary Details */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₹{totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span>GST (Total)</span>
                                    <span className="text-gray-800">₹{totals.tax.toFixed(2)}</span>
                                </div>
                                <div className="pt-3 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                                    <span className="text-lg font-black text-gray-800">Payable</span>
                                    <span className="text-2xl font-black text-blue-600">₹{Math.round(totals.total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info for Walk-in */}
                        {billType === 'Walk-in' && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Info</h3>
                                <div className="space-y-3">
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition font-medium text-sm"
                                        placeholder="Customer Name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition font-medium text-sm"
                                        placeholder="Phone Number"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Shift Guard */}
                        {!currentShift && (
                            <div className="bg-red-50 p-4 rounded-2xl flex gap-3 text-red-600 border border-red-100">
                                <AlertCircle size={24} className="shrink-0" />
                                <p className="text-xs font-bold leading-relaxed">Shift is currently CLOSED. Opening a shift is required for processing transactions.</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Buttons */}
                    <div className="p-8 bg-gray-50/80 border-t border-gray-100 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleCheckout('Cash')}
                                disabled={isProcessing || !currentShift || billItems.length === 0}
                                className="flex flex-col items-center justify-center p-4 bg-white hover:bg-green-50 rounded-2xl border-2 border-transparent hover:border-green-200 transition disabled:opacity-50 group"
                            >
                                <DollarSign className="text-green-600 mb-1 group-hover:scale-110 transition" />
                                <span className="text-xs font-black text-gray-500 uppercase">Cash</span>
                            </button>
                            <button
                                onClick={() => handleCheckout('UPI/Card')}
                                disabled={isProcessing || !currentShift || billItems.length === 0}
                                className="flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50 rounded-2xl border-2 border-transparent hover:border-blue-200 transition disabled:opacity-50 group"
                            >
                                <CreditCard className="text-blue-600 mb-1 group-hover:scale-110 transition" />
                                <span className="text-xs font-black text-gray-500 uppercase">Online</span>
                            </button>
                        </div>
                        <button
                            onClick={() => handleCheckout('Online')} // Default mix
                            disabled={isProcessing || !currentShift || billItems.length === 0}
                            className="w-full bg-blue-600 text-white py-4 rounded-3xl text-lg font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? 'PROCESSING...' : (
                                <><ShoppingCart size={22} /> FINALIZE BILL</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;
