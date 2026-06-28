import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { medicalDocumentService } from '../../services/medicalDocumentService';

interface DocumentUploadProps {
    patientId: string;
    onUploadSuccess: () => void;
}

export function DocumentUpload({ patientId, onUploadSuccess }: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('general');
    const [documentType, setDocumentType] = useState('other');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
            setError(null);
            // Auto-fill title with filename if empty
            if (!title) {
                setTitle(acceptedFiles[0].name.split('.')[0]);
            }
        }
    }, [title]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    const handleUpload = async () => {
        if (!selectedFile || !title) {
            setError('Please select a file and provide a title.');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            await medicalDocumentService.uploadAndCreate(selectedFile, patientId, {
                name: title,
                category: category as any,
                type: documentType, // Backend expects 'type'
            });

            setSuccess(true);
            setSelectedFile(null);
            setTitle('');
            setCategory('general');
            setTimeout(() => {
                setSuccess(false);
                onUploadSuccess();
            }, 2000);

        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Upload size={20} className="text-blue-600" />
                Upload Medical Record
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {success ? (
                <div className="mb-4 p-8 bg-green-50 text-green-700 text-center rounded-lg flex flex-col items-center gap-2 animate-fade-in">
                    <CheckCircle size={32} />
                    <span className="font-semibold">Upload Successful!</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Dropzone */}
                    {!selectedFile ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                            `}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                <Upload size={32} className="text-gray-400" />
                                <p className="font-medium">Drag & drop your file here, or click to select</p>
                                <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 10MB)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FileText size={24} className="text-blue-600" />
                                <div className="text-sm">
                                    <p className="font-medium text-blue-900 truncate max-w-[200px]">{selectedFile.name}</p>
                                    <p className="text-blue-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-1 hover:bg-blue-100 rounded-full text-blue-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {/* Metadata Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Blood Test Report"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="lab_report">Lab Report</option>
                                <option value="prescription">Prescription</option>
                                <option value="radiology">Radiology (X-Ray/CT)</option>
                                <option value="discharge_summary">Discharge Summary</option>
                                <option value="insurance">Insurance</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || !title || uploading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                </div>
            )}
        </div>
    );
}
