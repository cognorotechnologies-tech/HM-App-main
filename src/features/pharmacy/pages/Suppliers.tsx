import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';

interface Supplier {
    supplier_id: string;
    supplier_name: string;
    contact_person: string;
    phone_number: string;
    email: string;
    address: string;
    gstin: string;
    drug_license_number: string;
    payment_terms: string;
    credit_days: number;
    is_active: boolean;
}

const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({});
    const { token } = useAuthStore();

    useEffect(() => {
        fetchSuppliers();
    }, [searchTerm]);

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/pharmacy/suppliers', {
                params: { search: searchTerm }
            });
            setSuppliers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentSupplier.supplier_id) {
                await api.put(`/pharmacy/suppliers/${currentSupplier.supplier_id}`, currentSupplier);
            } else {
                await api.post('/pharmacy/suppliers', currentSupplier);
            }
            setShowModal(false);
            setCurrentSupplier({});
            fetchSuppliers();
        } catch (error) {
            console.error('Error saving supplier:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await api.delete(`/pharmacy/suppliers/${id}`);
            fetchSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Supplier Management</h1>
                <button
                    onClick={() => { setCurrentSupplier({}); setShowModal(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} />
                    Add Supplier
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                    <div key={supplier.supplier_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{supplier.supplier_name}</h3>
                                <p className="text-sm text-gray-500">{supplier.contact_person}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => { setCurrentSupplier(supplier); setShowModal(true); }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(supplier.supplier_id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                {supplier.phone_number}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                {supplier.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="truncate">{supplier.address}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                            <span>GSTIN: {supplier.gstin}</span>
                            <span>Terms: {supplier.payment_terms}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{currentSupplier.supplier_id ? 'Edit' : 'Add'} Supplier</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                                    <input
                                        required
                                        className="w-full p-2 border rounded"
                                        value={currentSupplier.supplier_name || ''}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, supplier_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                    <input
                                        className="w-full p-2 border rounded"
                                        value={currentSupplier.contact_person || ''}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, contact_person: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full p-2 border rounded"
                                        value={currentSupplier.email || ''}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        className="w-full p-2 border rounded"
                                        value={currentSupplier.phone_number || ''}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, phone_number: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        className="w-full p-2 border rounded"
                                        rows={2}
                                        value={currentSupplier.address || ''}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                                    <input
                                        className="w-full p-2 border rounded"
                                        value={currentSupplier.gstin || ''}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, gstin: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License No</label>
                                    <input
                                        className="w-full p-2 border rounded"
                                        value={currentSupplier.drug_license_number || ''}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, drug_license_number: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={currentSupplier.payment_terms || 'Net 30'}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, payment_terms: e.target.value })}
                                    >
                                        <option value="Advanced">Advanced</option>
                                        <option value="Net 15">Net 15</option>
                                        <option value="Net 30">Net 30</option>
                                        <option value="Net 60">Net 60</option>
                                        <option value="COD">COD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Days</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={currentSupplier.credit_days || 0}
                                        onChange={e => setCurrentSupplier({ ...currentSupplier, credit_days: parseInt(e.target.value) })}
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
                                    Save Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
