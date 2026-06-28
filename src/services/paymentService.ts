/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../lib/axios';

export interface PaymentTransaction {
    id: string;
    invoice_id: string;
    transaction_id: string;
    amount: number;
    payment_method: string;
    payment_gateway: string | null;
    gateway_transaction_id: string | null;
    gateway_response: any;
    status: string;
    processed_at: string | null;
    refunded_at: string | null;
    notes: string | null;
    processed_by: string | null;
    created_at: string;
}

export interface NewPaymentTransaction {
    invoice_id: string;
    transaction_id: string;
    amount: number;
    payment_method: string;
    payment_gateway?: string;
    gateway_transaction_id?: string;
    gateway_response?: any;
    status?: string;
    processed_at?: string;
    notes?: string;
    processed_by?: string;
}

export const paymentService = {
    async getAllTransactions(filters?: { invoice_id?: string; status?: string }) {
        const { data } = await api.get<PaymentTransaction[]>('/payments', { params: filters });
        return data;
    },

    async getTransactionById(id: string) {
        const { data } = await api.get<PaymentTransaction>(`/payments/${id}`);
        return data;
    },

    async createTransaction(transaction: NewPaymentTransaction) {
        const { data } = await api.post<PaymentTransaction>('/payments', transaction);
        return data;
    },

    async updateTransactionStatus(id: string, status: string, gatewayResponse?: any) {
        const { data } = await api.put<PaymentTransaction>(`/payments/${id}/status`, {
            status,
            gateway_response: gatewayResponse
        });
        return data;
    },

    // Alias for backwards compatibility
    async updatePaymentStatus(id: string, status: string, gatewayResponse?: any) {
        return this.updateTransactionStatus(id, status, gatewayResponse);
    },

    async refundTransaction(id: string, refundedBy?: string) {
        const { data } = await api.post<PaymentTransaction>(`/payments/${id}/refund`, {
            refunded_by: refundedBy
        });
        return data;
    },

    // Placeholder for online payment initialization - to be implemented
    async initializeOnlinePayment(invoiceId: string, amount: number, method: string) {
        // TODO: Implement gateway integration in backend
        const transaction_id = `TXN-${Date.now()}`;
        const payment_id = `PAY-${Date.now()}`;
        return { transaction_id, payment_id };
    },

    // Placeholder for stats methods - to be implemented in backend
    async getPaymentStats(startDate: string, endDate: string) {
        // TODO: Implement in backend
        return { total_payments: 0, successful: 0, failed: 0, refunded: 0 };
    }
};
