import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';

export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const { invoice_id, status } = req.query;
        const transactions = await PaymentService.getAllTransactions({
            invoice_id: invoice_id as string,
            status: status as string
        });
        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getTransactionById = async (req: Request, res: Response) => {
    try {
        const transaction = await PaymentService.getTransactionById(req.params.id as string);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const transaction = await PaymentService.createTransaction(req.body);
        res.status(201).json(transaction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTransactionStatus = async (req: Request, res: Response) => {
    try {
        const { status, gateway_response } = req.body;
        const transaction = await PaymentService.updateTransactionStatus(
            req.params.id as string,
            status,
            gateway_response
        );
        res.json(transaction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const refundTransaction = async (req: Request, res: Response) => {
    try {
        const { refunded_by } = req.body;
        const transaction = await PaymentService.refundTransaction(
            req.params.id as string,
            refunded_by
        );
        res.json(transaction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
