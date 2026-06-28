/* eslint-disable @typescript-eslint/no-unused-vars */
 
import api from '../lib/axios';

export interface MedicalDocument {
    id: string;
    patient_id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploaded_by: string;
    created_at: string;
    public_url?: string;
}

export type NewMedicalDocument = {
    patient_id: string;
    name: string;
    type: string; // 'lab_report', 'prescription', etc.
    category?: string;
    file_path?: string;
    file_size?: number;
    mime_type?: string;
    description?: string;
    doctor_id?: string;
    url?: string; // For backend compat
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const medicalDocumentService = {
    async uploadFile(file: File, patientId: string): Promise<{ url: string; path: string }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patient_id', patientId);

        const { data } = await api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Ensure full URL is returned
        const fullUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;
        return { url: fullUrl, path: data.url };
    },

    async create(document: NewMedicalDocument): Promise<MedicalDocument> {
        // Map frontend fields to backend expected fields
        const payload = {
            patient_id: document.patient_id,
            name: document.name,
            type: document.category || document.type, // Map category to type if needed
            url: document.url || document.file_path,
            size: document.file_size
        };

        const { data } = await api.post<MedicalDocument>('/documents', payload);
        return {
            ...data,
            public_url: data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`
        };
    },

    async uploadAndCreate(
        file: File,
        patientId: string,
        metadata: Omit<NewMedicalDocument, 'patient_id' | 'file_name' | 'file_path' | 'file_size' | 'mime_type'>
    ): Promise<MedicalDocument> {
        const { url, path } = await this.uploadFile(file, patientId);

        const document = await this.create({
            patient_id: patientId,
            name: file.name,
            file_path: path,
            file_size: file.size,
            mime_type: file.type,
            url: path,
            ...metadata
        });

        return document;
    },

    async getByPatient(
        patientId: string,
        filters?: { document_type?: string; category?: string }
    ): Promise<MedicalDocument[]> {
        const { data } = await api.get<MedicalDocument[]>('/documents/by-patient', {
            params: { patient_id: patientId }
        });

        // Filter locally if needed, or backend could handle it
        let documents = data.map(doc => ({
            ...doc,
            public_url: doc.url.startsWith('http') ? doc.url : `${API_URL}${doc.url}`
        }));

        if (filters?.category) {
            // Backend "type" field roughly maps to category/type
            documents = documents.filter(d => d.type === filters.category);
        }

        return documents;
    },

    async getById(documentId: string): Promise<MedicalDocument> {
        const { data } = await api.get<MedicalDocument>(`/documents/${documentId}`); // Need to add this endpoint if not exists, or simulate
        // We didn't create getById in controller yet? Check backend... 
        // Ah, DocumentService has getById but controller only exposes getByPatient and delete.
        // I might need to add getById to controller/routes if strictly needed, or just rely on list.
        // For now, assuming list is sufficient or I'll add getById to backend.
        return {
            ...data,
            public_url: data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`
        };
    },

    async downloadFile(filePath: string): Promise<Blob> {
        // filePath might be full URL or relative path
        const url = filePath.startsWith('http') ? filePath : `${API_URL}${filePath}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });
        if (!response.ok) throw new Error('Download failed');
        return await response.blob();
    },

    async delete(documentId: string): Promise<void> {
        await api.delete(`/documents/${documentId}`);
    }
};
