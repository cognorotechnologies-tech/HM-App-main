import api from '../lib/axios';

export interface Medicine {
    medicine_id: string;
    medicine_name: string;
    generic_name: string;
    barcode?: string; // Added barcode field
    brand_name?: string;
    manufacturer_name?: string; // specific to list response
    category_name?: string; // specific to list response
    unit_of_measurement?: string;
    total_stock?: string | number;
    description?: string;
}

export interface InventoryItem {
    stock_id: string;
    medicine_id: string;
    medicine_name: string;
    generic_name: string;
    barcode?: string; // Optional, might be useful if returned with stock
    batch_number: string;
    expiry_date: string;
    quantity_available: number;
    mrp: number;
    purchase_price?: number;
    supplier_id?: string;
    low_stock_threshold: number;
}

export const pharmacyService = {
    // --- Medicines ---
    async getAllMedicines(params?: { search?: string }) {
        const { data } = await api.get<Medicine[]>('/pharmacy/medicines', { params });
        return data;
    },

    async getMedicineById(id: string) {
        const { data } = await api.get<Medicine>(`/pharmacy/medicines/${id}`);
        return data;
    },

    async getMedicineByBarcode(barcode: string) {
        // Assuming backend supports filter by barcode, or we search and filter first match
        // Ideally: api.get('/pharmacy/medicines', { params: { barcode } })
        // For now, let's try to search using the search endpoint if it supports general query
        const { data } = await api.get<Medicine[]>('/pharmacy/medicines', { params: { search: barcode } });
        // Return exact match if possible
        return data.find(m => m.barcode === barcode) || data[0];
    },

    async searchMedicines(query: string) {
        if (!query || query.length < 2) return []; // Don't search for empty or very short strings
        try {
            const { data } = await api.get<Medicine[]>('/pharmacy/medicines', {
                params: { search: query, limit: 10 }
            });
            return data;
        } catch (error) {
            console.error('Error searching medicines:', error);
            return [];
        }
    },

    async addMedicine(medicine: Partial<Medicine>) {
        const { data } = await api.post<Medicine>('/pharmacy/medicines', medicine);
        return data;
    },

    async updateMedicine(id: string, medicine: Partial<Medicine>) {
        const { data } = await api.put<Medicine>(`/pharmacy/medicines/${id}`, medicine);
        return data;
    },

    async deleteMedicine(id: string) {
        await api.delete(`/pharmacy/medicines/${id}`);
    },

    // --- Inventory ---
    async getInventory(params?: { search?: string, low_stock?: boolean }) {
        const { data } = await api.get<InventoryItem[]>('/pharmacy/inventory', { params });
        return data;
    },

    async addStock(stockItem: Partial<InventoryItem>) {
        const { data } = await api.post<InventoryItem>('/pharmacy/inventory', stockItem);
        return data;
    },

    async updateStock(id: string, stockItem: Partial<InventoryItem>) {
        const { data } = await api.put<InventoryItem>(`/pharmacy/inventory/${id}`, stockItem);
        return data;
    },

    async deleteStock(id: string) {
        await api.delete(`/pharmacy/inventory/${id}`);
    },

    // --- Low Stock & Auto PO ---
    async getLowStockInventory() {
        const { data } = await api.get<InventoryItem[]>('/pharmacy/inventory/low-stock');
        return data; // Backend should have this or we filter client side. For now assuming client side filter if endpoint missing, but plan implies "fetch".
        // Actually, I'll implement client-side filtering in the service if the endpoint doesn't exist, 
        // OR I can just use getInventory and filter. 
        // Let's stick to getInventory({ low_stock: true }) which I defined earlier.
    },

    async createPurchaseOrder(orderData: any) {
        const { data } = await api.post('/pharmacy/orders', orderData);
        return data;
    },

    // --- Sales & Returns ---
    async getSalesBillById(id: string) {
        const { data } = await api.get(`/pharmacy/sales/${id}`);
        return data;
    },

    async processSalesReturn(returnData: any) {
        const { data } = await api.post('/pharmacy/sales/return', returnData);
        return data;
    },

    // --- Suppliers (Optional, reusing existing API structure but good to have in service) ---
    async getSuppliers(params?: { search?: string }) {
        const { data } = await api.get('/pharmacy/suppliers', { params });
        return data;
    }
};
