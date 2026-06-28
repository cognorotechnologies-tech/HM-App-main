import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService';
import path from 'path';

export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Construct URL based on server config
        // Assuming uploads are served statically from /uploads
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createDocument = async (req: Request, res: Response) => {
    try {
        const document = await DocumentService.create({
            ...req.body,
            uploaded_by: (req as any).user.userId
        });
        res.status(201).json(document);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getByPatient = async (req: Request, res: Response) => {
    try {
        const { patient_id } = req.query;
        if (!patient_id) {
            return res.status(400).json({ error: 'patient_id is required' });
        }
        const documents = await DocumentService.getByPatient(patient_id as string);
        res.json(documents);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const document = await DocumentService.delete(req.params.id as string);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
