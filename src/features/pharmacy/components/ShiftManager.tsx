import React, { useState } from 'react';
import { PlayCircle, StopCircle, DollarSign, Lock } from 'lucide-react';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';
import { useShift } from '../context/ShiftContext';

const ShiftManager: React.FC = () => {
    const { currentShift, checkShiftStatus } = useShift();
    const { token } = useAuthStore();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleOpenShift = async () => {
        setLoading(true);
        try {
            await api.post('/pharmacy/shift/open',
                { openingCash: parseFloat(amount) || 0 }
            );
            await checkShiftStatus();
            setAmount('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to open shift');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseShift = async () => {
        if (!window.confirm('Are you sure you want to close your shift?')) return;
        setLoading(true);
        try {
            await api.post('/pharmacy/shift/close',
                { closingCash: parseFloat(amount) || 0 }
            );
            await checkShiftStatus();
            setAmount('');
            alert('Shift Closed Successfully');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to close shift');
        } finally {
            setLoading(false);
        }
    };

    if (currentShift) {
        return (
            <div className="bg-green-50 px-4 py-2 rounded-lg flex items-center justify-between border border-green-200">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                        <p className="text-xs text-green-700 font-bold uppercase tracking-wide">Shift Active</p>
                        <p className="text-xs text-green-600">Since {new Date(currentShift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Closing Cash"
                        className="w-24 text-xs px-2 py-1 border rounded"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <button
                        onClick={handleCloseShift}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md transition"
                        title="Close Shift"
                    >
                        <StopCircle size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center animate-fade-in">
            <div className="flex justify-center mb-2 text-red-500"><Lock size={24} /></div>
            <h3 className="text-sm font-bold text-red-800 mb-1">Shift Closed</h3>
            <p className="text-xs text-red-600 mb-3">You must open a shift to perform billing.</p>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <DollarSign size={14} className="absolute left-2 top-2 text-gray-400" />
                    <input
                        type="number"
                        placeholder="Opening Cash"
                        className="w-full pl-6 pr-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleOpenShift}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1"
                >
                    <PlayCircle size={14} /> Open
                </button>
            </div>
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
    );
};

export default ShiftManager;
