// @ts-nocheck
// Lab Test Ordering Modal
import React, { useState, useEffect } from 'react';
import { X, Search, ShoppingCart, Beaker, Filter } from 'lucide-react';
import api from '../lib/axios';

interface LabTest {
    id: number;
    test_code: string;
    test_name: string;
    category: string;
    price: number;
    sample_type: string;
    fasting_required: boolean;
    is_popular: boolean;
}

interface LabTestOrderingModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: number;
    doctorId: number;
    appointmentId?: number;
    onOrderPlaced?: (orderId: number) => void;
}

export const LabTestOrderingModal: React.FC<LabTestOrderingModalProps> = ({
    isOpen,
    onClose,
    patientId,
    doctorId,
    appointmentId,
    onOrderPlaced
}) => {
    const [tests, setTests] = useState<LabTest[]>([]);
    const [filteredTests, setFilteredTests] = useState<LabTest[]>([]);
    const [selectedTests, setSelectedTests] = useState<LabTest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTests();
            fetchCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        filterTests();
    }, [tests, searchQuery, selectedCategory]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lab-tests');
            setTests(response.data);
        } catch (error) {
            console.error('Error fetching tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/lab-tests/categories');
            setCategories(['All', ...response.data]);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const filterTests = () => {
        let filtered = [...tests];

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(test => test.category === selectedCategory);
        }

        // Filter by search
        if (searchQuery) {
            filtered = filtered.filter(test =>
                test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                test.test_code.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredTests(filtered);
    };

    const toggleTestSelection = (test: LabTest) => {
        const isSelected = selectedTests.some(t => t.id === test.id);
        if (isSelected) {
            setSelectedTests(selectedTests.filter(t => t.id !== test.id));
        } else {
            setSelectedTests([...selectedTests, test]);
        }
    };

    const getTotalAmount = () => {
        return selectedTests.reduce((sum, test) => sum + test.price, 0);
    };

    const handleSubmitOrder = async () => {
        if (selectedTests.length === 0) return;

        try {
            setSubmitting(true);
            const orderData = {
                patient_id: patientId,
                doctor_id: doctorId,
                appointment_id: appointmentId,
                ordered_tests: selectedTests.map(test => ({
                    test_id: test.id,
                    test_name: test.test_name,
                    test_code: test.test_code,
                    price: test.price
                })),
                total_amount: getTotalAmount(),
                priority: 'routine'
            };

            const response = await api.post('/lab-orders', orderData);

            if (onOrderPlaced) {
                onOrderPlaced(response.data.id);
            }

            // Reset and close
            setSelectedTests([]);
            setSearchQuery('');
            setSelectedCategory('All');
            onClose();
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place lab test order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Beaker className="text-indigo-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Order Lab Tests</h2>
                            <p className="text-sm text-gray-600">Select tests for the patient</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="p-6 border-b border-gray-200 space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search tests by name or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={20} className="text-gray-500" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tests Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredTests.length === 0 ? (
                        <div className="text-center py-12">
                            <Beaker className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-gray-600">No tests found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTests.map(test => {
                                const isSelected = selectedTests.some(t => t.id === test.id);
                                return (
                                    <div
                                        key={test.id}
                                        onClick={() => toggleTestSelection(test)}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900 text-sm">{test.test_name}</h3>
                                            {test.is_popular && (
                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{test.test_code}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{test.category}</span>
                                            <span className="font-bold text-indigo-600">₹{test.price}</span>
                                        </div>
                                        {test.fasting_required && (
                                            <p className="text-xs text-orange-600 mt-2">⚠️ Fasting required</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer with Cart Summary */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={20} className="text-gray-600" />
                            <span className="text-gray-700">
                                {selectedTests.length} {selectedTests.length === 1 ? 'test' : 'tests'} selected
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-indigo-600">₹{getTotalAmount()}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitOrder}
                            disabled={selectedTests.length === 0 || submitting}
                            className={`flex-1 px-6 py-3 rounded-lg transition font-medium ${selectedTests.length === 0 || submitting
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                        >
                            {submitting ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabTestOrderingModal;
