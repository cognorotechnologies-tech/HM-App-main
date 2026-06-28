import { Request, Response } from 'express';
import { BillingService } from '../services/billingService';

export const getAllInvoices = async (req: Request, res: Response) => {
    try {
        const { patient_id, status } = req.query;
        const invoices = await BillingService.getAllInvoices({
            patient_id: patient_id as string,
            status: status as string
        });
        res.json(invoices);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const invoice = await BillingService.getInvoiceById(req.params.id as string);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createInvoice = async (req: Request, res: Response) => {
    try {
        const invoice = await BillingService.createInvoice(req.body);
        res.status(201).json(invoice);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateInvoice = async (req: Request, res: Response) => {
    try {
        const invoice = await BillingService.updateInvoice(req.params.id as string, req.body);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteInvoice = async (req: Request, res: Response) => {
    try {
        const invoice = await BillingService.deleteInvoice(req.params.id as string);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
