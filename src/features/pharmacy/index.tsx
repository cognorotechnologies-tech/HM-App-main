import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PharmacyLayout from './components/PharmacyLayout';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Medicines from './pages/Medicines';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import CreatePurchaseOrder from './pages/CreatePurchaseOrder';
import GRNEntry from './pages/GRNEntry';
import Reports from './pages/Reports';
import SalesReturn from './pages/SalesReturn';
import SalesHistory from './pages/SalesHistory';
import ShiftHistory from './pages/ShiftHistory';

import { ShiftProvider } from './context/ShiftContext';

const Pharmacy: React.FC = () => {
    return (
        <ShiftProvider>
            <PharmacyLayout>
                <Routes>
                    <Route path="/" element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="medicines" element={<Medicines />} />
                    <Route path="suppliers" element={<Suppliers />} />
                    <Route path="purchases" element={<Purchases />} />
                    <Route path="purchases/new" element={<CreatePurchaseOrder />} />
                    <Route path="purchases/:id/receive" element={<GRNEntry />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="return" element={<SalesReturn />} />
                    <Route path="sales-history" element={<SalesHistory />} />
                    <Route path="shift-history" element={<ShiftHistory />} />
                    <Route path="*" element={<div className="p-8">Page Not Found</div>} />
                </Routes>
            </PharmacyLayout>
        </ShiftProvider>
    );
};

export default Pharmacy;
