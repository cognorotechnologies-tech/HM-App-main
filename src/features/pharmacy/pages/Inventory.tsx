import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Edit, Eye, Trash2, X, RefreshCcw } from 'lucide-react';
import { pharmacyService, InventoryItem, Medicine } from '../../../services/pharmacyService';

const Inventory: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<InventoryItem>>({});
    const [medicines, setMedicines] = useState<Medicine[]>([]); // For dropdown in modal

    // Fetch inventory from backend
    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await pharmacyService.getInventory({ search: searchTerm });
            setInventory(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to fetch medicine list for dropdown
    const fetchMedicines = async () => {
        try {
            const data = await pharmacyService.getAllMedicines();
            setMedicines(data);
        } catch (error) {
            console.error('Error fetching medicines for dropdown:', error);
        }
    }

    const [filterType, setFilterType] = useState<'all' | 'expiring'>('all');

    useEffect(() => {
        fetchInventory();
        fetchMedicines();

        // Polling every 30 seconds
        const interval = setInterval(() => {
            fetchInventory();
        }, 30000);

        return () => clearInterval(interval);
    }, [searchTerm]); // Removed filterType from dependency to filter client side for better performance or server side? 
    // Let's filter client side to avoid another roundtrip for now as data size is likely small, 
    // OR server side. Plan says "Filter Option". 
    // I'll stick to client side filtering on the `inventory` state for simplicity unless dataset is huge.
    // Actually, let's just derive the filtered list.

    const filteredInventory = inventory.filter(item => {
        if (filterType === 'expiring') {
            const expiryDate = new Date(item.expiry_date);
            const threeMonthsFromNow = new Date();
            threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
            return expiryDate <= threeMonthsFromNow;
        }
        return true;
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentItem.stock_id) {
                await pharmacyService.updateStock(currentItem.stock_id, currentItem);
            } else {
                await pharmacyService.addStock(currentItem);
            }
            setShowModal(false);
            fetchInventory();
        } catch (error) {
            console.error('Error saving stock:', error);
            alert('Failed to save stock item');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this stock entry?')) {
            try {
                await pharmacyService.deleteStock(id);
                fetchInventory();
            } catch (error) {
                console.error('Error deleting stock:', error);
                alert('Failed to delete stock item');
            }
        }
    };

    const openModal = (item?: InventoryItem) => {
        if (item) {
            setCurrentItem(item);
        } else {
            setCurrentItem({
                quantity_available: 0,
                mrp: 0,
                low_stock_threshold: 10
            });
        }
        setShowModal(true);
    };

    return (
        <div className="space-y-6 p-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition ${filterType === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                All Stock
                            </button>
                            <button
                                onClick={() => setFilterType('expiring')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition ${filterType === 'expiring' ? 'bg-red-50 text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Expiring Soon
                            </button>
                        </div>
                        <button
                            onClick={() => fetchInventory()}
                            className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Refresh Data"
                        >
                            <RefreshCcw size={18} />
                        </button>
                    </div>
                    <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Download size={18} />
                            <span>Export</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => openModal()}>
                            <Plus size={18} />
                            <span>Add Stock</span>
                        </button>
                    </div>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Medicine Name</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Generic</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Batch</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Expiry</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Stock</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">MRP</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-4">Loading inventory...</td></tr>
                        ) : filteredInventory.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-4">No stock found matching criteria.</td></tr>
                        ) : filteredInventory.map((item) => {
                            const isExpiring = new Date(item.expiry_date) <= new Date(new Date().setMonth(new Date().getMonth() + 3));
                            return (
                                <tr key={item.stock_id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${isExpiring ? 'bg-red-50/50' : ''}`}>
                                    <td className="py-4 text-sm font-medium text-gray-800">{item.medicine_name}</td>
                                    <td className="py-4 text-sm text-gray-600">{item.generic_name}</td>
                                    <td className="py-4 text-sm text-gray-600">{item.batch_number}</td>
                                    <td className="py-4 text-sm text-gray-600">
                                        <span className={isExpiring ? 'text-red-600 font-bold flex items-center gap-1' : ''}>
                                            {new Date(item.expiry_date).toLocaleDateString()}
                                            {isExpiring && <span className="text-[10px] bg-red-100 px-1 rounded border border-red-200">EXP</span>}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.quantity_available < (item.low_stock_threshold || 10) ? 'bg-red-100 text-red-700' :
                                            item.quantity_available < 100 ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {item.quantity_available}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm font-semibold text-gray-800">₹{item.mrp}</td>
                                    <td className="py-4">
                                        <div className="flex space-x-2">
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" onClick={() => openModal(item)}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded" onClick={() => handleDelete(item.stock_id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{currentItem.stock_id ? 'Edit' : 'Add'} Stock</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Scan Barcode</label>
                                <div className="relative">
                                    <input
                                        autoFocus
                                        className="w-full p-2 pl-10 border-2 border-purple-200 rounded focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                                        placeholder="Scan barcode here..."
                                        onKeyDown={async (e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const code = e.currentTarget.value;
                                                if (code.length > 3) {
                                                    try {
                                                        const med = await pharmacyService.getMedicineByBarcode(code);
                                                        if (med) {
                                                            setCurrentItem({
                                                                ...currentItem,
                                                                medicine_id: med.medicine_id,
                                                                medicine_name: med.medicine_name,
                                                                generic_name: med.generic_name
                                                            });
                                                            // Optional: Focus batch field
                                                            const batchInput = document.getElementById('batchInput');
                                                            if (batchInput) batchInput.focus();
                                                        } else {
                                                            alert('Medicine not found for this barcode');
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                    <span className="absolute left-3 top-2.5 text-purple-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14" /><path d="M8 5v14" /><path d="M12 5v14" /><path d="M17 5v14" /><path d="M21 5v14" /></svg>
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine *</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={currentItem.medicine_id || ''}
                                    onChange={e => {
                                        const selectedMed = medicines.find(m => m.medicine_id === e.target.value);
                                        setCurrentItem({
                                            ...currentItem,
                                            medicine_id: e.target.value,
                                            medicine_name: selectedMed?.medicine_name,
                                            generic_name: selectedMed?.generic_name
                                        })
                                    }}
                                    disabled={!!currentItem.stock_id} // Disable changing medicine on edit
                                >
                                    <option value="">Select Medicine</option>
                                    {medicines.map(med => (
                                        <option key={med.medicine_id} value={med.medicine_id}>
                                            {med.medicine_name} ({med.generic_name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
                                    <input
                                        id="batchInput"
                                        required
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={currentItem.batch_number || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, batch_number: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={currentItem.expiry_date ? new Date(currentItem.expiry_date).toISOString().split('T')[0] : ''}
                                        onChange={e => setCurrentItem({ ...currentItem, expiry_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={currentItem.quantity_available || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, quantity_available: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={currentItem.mrp || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, mrp: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={currentItem.purchase_price || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, purchase_price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={currentItem.low_stock_threshold || ''}
                                        onChange={e => setCurrentItem({ ...currentItem, low_stock_threshold: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save Stock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
