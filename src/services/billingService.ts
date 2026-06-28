import api from '../lib/axios';

export interface Invoice {
    id: string;
    invoice_number: string;
    patient_id: string;
    appointment_id: string | null;
    issue_date: string;
    due_date: string | null;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;
    payment_status: string;
    notes: string | null;
    terms: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    items?: InvoiceItem[];
}

export interface InvoiceItem {
    id: string;
    invoice_id: string;
    service_type: string;
    description: string;
    item_code: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    tax_rate: number | null;
    tax_amount: number | null;
    discount_percent: number | null;
    discount_amount: number | null;
}

export interface NewInvoice {
    patient_id: string;
    appointment_id?: string;
    invoice_number: string;
    issue_date?: string;
    due_date?: string;
    subtotal?: number;
    tax_amount?: number;
    discount_amount?: number;
    total_amount: number;
    paid_amount?: number;
    payment_status?: string;
    notes?: string;
    terms?: string;
    created_by?: string;
    items?: Array<Omit<InvoiceItem, 'id' | 'invoice_id'>>;
}

export type BillingInvoice = Invoice; // Alias for backwards compatibility

export const billingService = {
    async getAllInvoices(filters?: { patient_id?: string; status?: string }) {
        const { data } = await api.get<Invoice[]>('/billing', { params: filters });
        return data;
    },

    async getInvoiceById(id: string) {
        const { data } = await api.get<Invoice>(`/billing/${id}`);
        return data;
    },

    // Alias for backwards compatibility
    async getInvoice(id: string) {
        return this.getInvoiceById(id);
    },

    // Alias for patient invoices
    async getPatientInvoices(patientId: string) {
        return this.getAllInvoices({ patient_id: patientId });
    },

    async createInvoice(invoice: NewInvoice) {
        const { data } = await api.post<Invoice>('/billing', invoice);
        return data;
    },

    // Alias for create with items (items are part of NewInvoice)
    async createInvoiceWithItems(invoiceData: NewInvoice) {
        return this.createInvoice(invoiceData);
    },

    async updateInvoice(id: string, updates: Partial<{
        payment_status: string;
        paid_amount: number;
        notes: string;
        terms: string;
    }>) {
        const { data } = await api.put<Invoice>(`/billing/${id}`, updates);
        return data;
    },

    async deleteInvoice(id: string) {
        await api.delete(`/billing/${id}`);
    },

    // Placeholder for stats methods - to be implemented in backend
    async getRevenueStats(startDate: string, endDate: string) {
        // TODO: Implement in backend
        return { total_revenue: 0, paid: 0, pending: 0, cancelled: 0 };
    },

    // Deprecated - items are created with invoice
    async addLineItem(invoiceId: string, item: any) {
        console.warn('addLineItem is deprecated - items should be included when creating invoice');
        return null;
    }
};
