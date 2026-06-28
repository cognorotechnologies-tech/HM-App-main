import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';

interface ShiftContextType {
    currentShift: any | null;
    checkShiftStatus: () => Promise<void>;
    loading: boolean;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuthStore();
    const [currentShift, setCurrentShift] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const checkShiftStatus = async () => {
        if (!token) return;
        try {
            const res = await api.get('/pharmacy/shift/current');
            setCurrentShift(res.data);
        } catch (error) {
            console.error('Failed to check shift status', error);
            setCurrentShift(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkShiftStatus();
    }, [token]);

    return (
        <ShiftContext.Provider value={{ currentShift, checkShiftStatus, loading }}>
            {children}
        </ShiftContext.Provider>
    );
};

export const useShift = () => {
    const context = useContext(ShiftContext);
    if (!context) {
        throw new Error('useShift must be used within a ShiftProvider');
    }
    return context;
};
