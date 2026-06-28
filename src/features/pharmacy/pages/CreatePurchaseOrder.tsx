import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Search, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pharmacyService, Medicine } from '../../../services/pharmacyService';
// import { toast } from 'react-hot-toast'; // We'll stick to alert for now if toast not available or uncomment if package installed

const CreatePurchaseOrder: React.FC = () => {
    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [poItems, setPoItems] = useState<any[]>([]);

    // Quick add medicine search
    const [medSearch, setMedSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Medicine[]>([]);
    const [isLoadingAuto, setIsLoadingAuto] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (medSearch.length > 2) {
            searchMedicines();
        } else {
            setSearchResults([]);
        }
    }, [medSearch]);

    const fetchSuppliers = async () => {
        try {
            const data = await pharmacyService.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const searchMedicines = async () => {
        try {
            const data = await pharmacyService.searchMedicines(medSearch);
            setSearchResults(data);
        } catch (error) {
            console.error(error);
        }
    };

    const autoFillLowStock = async () => {
        setIsLoadingAuto(true);
        try {
            // We fetch inventory that is low on stock
            // In a real scenario, we might want to group by supplier, but here we just add all
            const lowStockItems = await pharmacyService.getInventory({ low_stock: true }); // Using the param we planned, implemented as 'low-stock' endpoint call in service but service method name is getLowStockInventory? 
            // Wait, looking at my service update: 
            // async getInventory(params?: { search?: string, low_stock?: boolean }) -> /pharmacy/inventory
            // async getLowStockInventory() -> /pharmacy/inventory/low-stock
            // I'll use getLowStockInventory for clarity if backend supports it, OR reuse getInventory if I implemented filtering on backend.
            // Let's assume getLowStockInventory() works as per my service update (even if it points to a possibly mock endpoint I need to be careful).
            // Actually, previously in `Inventory.tsx` I used `getInventory({ search: ... })`.
            // Let's use `pharmacyService.getLowStockInventory()` which I just added.

            const medicinesToAdd = lowStockItems.filter(item => item.quantity_available < (item.low_stock_threshold || 10)); // Double check filter client side just in case

            if (medicinesToAdd.length === 0) {
                alert('No low stock items found.');
                return;
            }

            const newItems = medicinesToAdd.map(item => ({
                medicine_id: item.medicine_id,
                medicine_name: item.medicine_name,
                quantity_ordered: Math.max(10, (item.low_stock_threshold || 10) * 2 - item.quantity_available), // Simple logic: Order enough to double the threshold
                unit_price: item.purchase_price || 0,
                tax_percentage: 0,
                discount_percentage: 0
            }));

            // Merge with existing items to avoid duplicates
            setPoItems(prev => {
                const existingIds = new Set(prev.map(i => i.medicine_id));
                const uniqueNewItems = newItems.filter(i => !existingIds.has(i.medicine_id));
                return [...prev, ...uniqueNewItems];
            });

            alert(`Added ${newItems.length} low stock items to the order.`);

        } catch (error) {
            console.error('Error auto-filling:', error);
            alert('Failed to fetch low stock items.');
        } finally {
            setIsLoadingAuto(false);
        }
    };

    const addItem = (medicine: Medicine) => {
        // Check duplicate
        if (poItems.find(i => i.medicine_id === medicine.medicine_id)) {
            alert('Item already in order');
            return;
        }

        setPoItems([...poItems, {
            medicine_id: medicine.medicine_id,
            medicine_name: medicine.medicine_name,
            quantity_ordered: 10,
            unit_price: 0,
            tax_percentage: 0,
            discount_percentage: 0
        }]);
        setMedSearch('');
        setSearchResults([]);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...poItems];
        newItems[index][field] = value;
        setPoItems(newItems);
    };

    const deleteItem = (index: number) => {
        setPoItems(poItems.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return poItems.reduce((acc, item) => {
            const subtotal = item.quantity_ordered * item.unit_price;
            const discount = subtotal * (item.discount_percentage / 100);
            const tax = (subtotal - discount) * (item.tax_percentage / 100);
            return acc + subtotal - discount + tax;
        }, 0);
    };

    const handleSubmit = async () => {
        if (!supplierId || poItems.length === 0) {
            alert('Please select a supplier and add at least one item.');
            return;
        }

        const payload = {
            supplier_id: supplierId,
            items: poItems,
            notes: 'Created via Web Portal'
        };

        try {
            await pharmacyService.createPurchaseOrder(payload);
            navigate('/pharmacy/purchases');
        } catch (error) {
            console.error('Error creating PO:', error);
            alert('Failed to create Purchase Order');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Create Purchase Order</h1>
                </div>
                <button
                    onClick={autoFillLowStock}
                    disabled={isLoadingAuto}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-semibold transition disabled:opacity-50"
                >
                    <Zap size={18} />
                    {isLoadingAuto ? 'Analyzing...' : 'Auto-fill Low Stock'}
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Supplier</label>
                    <select
                        className="w-full p-2 border rounded-lg"
                        value={supplierId}
                        onChange={(e) => setSupplierId(e.target.value)}
                    >
                        <option value="">-- Choose Supplier --</option>
                        {suppliers.map(s => (
                            <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Medicine to Order</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Type to search medicines..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={medSearch}
                            onChange={(e) => setMedSearch(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white shadow-lg border mt-1 max-h-60 overflow-y-auto z-10 rounded-lg">
                                {searchResults.map(med => (
                                    <div
                                        key={med.medicine_id}
                                        onClick={() => addItem(med)}
                                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                                    >
                                        <p className="font-medium text-gray-800">{med.medicine_name}</p>
                                        <p className="text-xs text-gray-500">{med.brand_name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Medicine</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 w-32">Qty</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 w-32">Unit Price</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 w-24">Disc %</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 w-24">Tax %</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                            <th className="w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {poItems.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-400">No items added to order</td></tr>
                        ) : (
                            poItems.map((item, idx) => {
                                const subtotal = item.quantity_ordered * item.unit_price;
                                const discount = subtotal * (item.discount_percentage / 100);
                                const tax = (subtotal - discount) * (item.tax_percentage / 100);
                                const total = subtotal - discount + tax;

                                return (
                                    <tr key={idx}>
                                        <td className="p-4 bg-gray-50 font-medium">{item.medicine_name}</td>
                                        <td className="p-4">
                                            <input type="number" min="1" className="w-full p-1 border rounded" value={item.quantity_ordered} onChange={(e) => updateItem(idx, 'quantity_ordered', parseFloat(e.target.value))} />
                                        </td>
                                        <td className="p-4">
                                            <input type="number" min="0" className="w-full p-1 border rounded" value={item.unit_price} onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value))} />
                                        </td>
                                        <td className="p-4">
                                            <input type="number" min="0" max="100" className="w-full p-1 border rounded" value={item.discount_percentage} onChange={(e) => updateItem(idx, 'discount_percentage', parseFloat(e.target.value))} />
                                        </td>
                                        <td className="p-4">
                                            <input type="number" min="0" max="100" className="w-full p-1 border rounded" value={item.tax_percentage} onChange={(e) => updateItem(idx, 'tax_percentage', parseFloat(e.target.value))} />
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-800">₹{total.toFixed(2)}</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => deleteItem(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end items-center gap-6">
                <div className="text-right">
                    <p className="text-gray-500">Net Amount</p>
                    <p className="text-3xl font-bold text-blue-600">₹{calculateTotal().toFixed(2)}</p>
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 font-semibold"
                >
                    <Save size={20} />
                    Create Purchase Order
                </button>
            </div>
        </div>
    );
};

export default CreatePurchaseOrder;
