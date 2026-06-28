import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, X } from 'lucide-react';
import { pharmacyService, Medicine } from '../../../services/pharmacyService';
// import { toast } from 'react-hot-toast'; 

const Medicines: React.FC = () => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentMedicine, setCurrentMedicine] = useState<Partial<Medicine>>({});

    // Fetch medicines from backend
    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const data = await pharmacyService.getAllMedicines({ search: searchTerm });
            setMedicines(data);
        } catch (error) {
            console.error('Error fetching medicines:', error);
            // toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, [searchTerm]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentMedicine.medicine_id) {
                await pharmacyService.updateMedicine(currentMedicine.medicine_id, currentMedicine);
                // toast.success('Medicine updated successfully');
            } else {
                await pharmacyService.addMedicine(currentMedicine);
                // toast.success('Medicine added successfully');
            }
            setShowModal(false);
            fetchMedicines();
        } catch (error) {
            console.error('Error saving medicine:', error);
            alert('Failed to save medicine');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            try {
                await pharmacyService.deleteMedicine(id);
                // toast.success('Medicine deleted successfully');
                fetchMedicines();
            } catch (error) {
                console.error('Error deleting medicine:', error);
                alert('Failed to delete medicine');
            }
        }
    };

    const openModal = (medicine?: Medicine) => {
        if (medicine) {
            setCurrentMedicine(medicine);
        } else {
            setCurrentMedicine({});
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
                                placeholder="Search medicines..."
                                className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => openModal()}>
                            <Plus size={18} />
                            <span>Add Medicine</span>
                        </button>
                    </div>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Medicine Name</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Generic</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Stock</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Unit</th>
                            <th className="text-left py-3 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4">Loading medicines...</td></tr>
                        ) : medicines.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-4">No medicines found.</td></tr>
                        ) : medicines.map((medicine) => (
                            <tr key={medicine.medicine_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="py-4 text-sm font-medium text-gray-800">{medicine.medicine_name}</td>
                                <td className="py-4 text-sm text-gray-600">{medicine.generic_name}</td>
                                <td className="py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${(Number(medicine.total_stock) || 0) < 100 ? 'bg-red-100 text-red-700' :
                                        (Number(medicine.total_stock) || 0) < 300 ? 'bg-orange-100 text-orange-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {medicine.total_stock || 0}
                                    </span>
                                </td>
                                <td className="py-4 text-sm text-gray-800">{medicine.unit_of_measurement}</td>
                                <td className="py-4">
                                    <div className="flex space-x-2">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" onClick={() => openModal(medicine)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-2 text-red-600 hover:bg-red-50 rounded" onClick={() => handleDelete(medicine.medicine_id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{currentMedicine.medicine_id ? 'Edit' : 'Add'} Medicine</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                                <input
                                    required
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={currentMedicine.medicine_name || ''}
                                    onChange={e => setCurrentMedicine({ ...currentMedicine, medicine_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name *</label>
                                <input
                                    required
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={currentMedicine.generic_name || ''}
                                    onChange={e => setCurrentMedicine({ ...currentMedicine, generic_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode (EAN/UPC)</label>
                                <input
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    placeholder="Scan or type barcode"
                                    value={currentMedicine.barcode || ''}
                                    onChange={e => setCurrentMedicine({ ...currentMedicine, barcode: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                    <input
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={currentMedicine.brand_name || ''}
                                        onChange={e => setCurrentMedicine({ ...currentMedicine, brand_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                                    <input
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={currentMedicine.manufacturer_name || ''}
                                        onChange={e => setCurrentMedicine({ ...currentMedicine, manufacturer_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={currentMedicine.category_name || ''}
                                        onChange={e => setCurrentMedicine({ ...currentMedicine, category_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <select
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={currentMedicine.unit_of_measurement || 'Tablet'}
                                        onChange={e => setCurrentMedicine({ ...currentMedicine, unit_of_measurement: e.target.value })}
                                    >
                                        <option value="Tablet">Tablet</option>
                                        <option value="Capsule">Capsule</option>
                                        <option value="Syrup">Syrup</option>
                                        <option value="Injection">Injection</option>
                                        <option value="Cream">Cream</option>
                                        <option value="Ointment">Ointment</option>
                                        <option value="Drops">Drops</option>
                                        <option value="Powder">Powder</option>
                                        <option value="Sachet">Sachet</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                    value={currentMedicine.description || ''}
                                    onChange={e => setCurrentMedicine({ ...currentMedicine, description: e.target.value })}
                                />
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
                                    Save Medicine
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Medicines;
