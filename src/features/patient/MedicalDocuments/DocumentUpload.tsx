import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { medicalDocumentService } from '../../../services/medicalDocumentService';
import { useToast } from '../../../contexts/ToastContext';

type DocumentType = 'lab_report' | 'xray' | 'ct_scan' | 'prescription' | 'other';
type DocumentCategory = 'radiology' | 'pathology' | 'prescription' | 'documents';

interface DocumentUploadProps {
    patientId: string;
    onUploadComplete?: () => void;
}

export default function DocumentUpload({ patientId, onUploadComplete }: DocumentUploadProps) {
    const toast = useToast();
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<DocumentType>('other');
    const [category, setCategory] = useState<DocumentCategory>('documents');
    const [tags, setTags] = useState('');
    const [notes, setNotes] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false,
    });

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }

        setUploading(true);

        try {
            await medicalDocumentService.uploadAndCreate(selectedFile, patientId, {
                document_type: documentType,
                category,
                notes: notes.trim() || undefined,
            } as any);

            toast.success('Document uploaded successfully!');

            // Reset form
            setSelectedFile(null);
            setDocumentType('other');
            setCategory('documents');
            setTags('');
            setNotes('');

            onUploadComplete?.();
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Medical Document</h3>

            {/* File Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                    }`}
            >
                <input {...getInputProps()} />

                {selectedFile ? (
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded">
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                <p className="text-sm text-gray-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                            }}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-1">
                            {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
                        </p>
                        <p className="text-sm text-gray-500">or click to browse</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Supports: PDF, JPG, PNG (Max 10MB)
                        </p>
                    </div>
                )}
            </div>

            {selectedFile && (
                <div className="mt-6 space-y-4">
                    {/* Document Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document Type *
                        </label>
                        <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="lab_report">Lab Report</option>
                            <option value="xray">X-Ray</option>
                            <option value="ct_scan">CT Scan</option>
                            <option value="prescription">Prescription</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="radiology">Radiology</option>
                            <option value="pathology">Pathology</option>
                            <option value="prescription">Prescription</option>
                            <option value="documents">General Documents</option>
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., blood-test, routine-checkup"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Add any additional notes..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Upload Document
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
