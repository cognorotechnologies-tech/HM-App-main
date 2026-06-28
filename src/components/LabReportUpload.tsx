import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useToast } from '../hooks/useToast';

interface LabReportUploadProps {
    isOpen: boolean;
    onClose: () => void;
    onAnalysisComplete: (data: any) => void;
}

export const LabReportUpload: React.FC<LabReportUploadProps> = ({ isOpen, onClose, onAnalysisComplete }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any[] | null>(null);
    const toast = useToast();

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Create preview
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        try {
            setAnalyzing(true);
            const result = await aiService.uploadLabReport(file);
            setAnalysisResult(result.analysis);
            toast.success('Report analyzed successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to analyze report');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleConfirm = () => {
        if (analysisResult) {
            onAnalysisComplete(analysisResult);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Smart Lab Report Analysis</h2>
                            <p className="text-sm text-gray-500">Upload a report image to extract values automatically</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Upload & Preview */}
                        <div className="space-y-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {previewUrl ? (
                                    <div className="relative">
                                        <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                                setPreviewUrl(null);
                                                setAnalysisResult(null);
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium">Click to upload report image</p>
                                        <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
                                    </div>
                                )}
                            </div>

                            {file && !analysisResult && (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {analyzing ? (
                                        <>
                                            <Loader2 className="animate-spin" /> Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <FileText size={18} /> Analyze with AI
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Right: Analysis Results */}
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 h-full min-h-[400px]">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="text-green-600" size={18} />
                                Extracted Results
                            </h3>

                            {analyzing ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p>Extracting data from report...</p>
                                </div>
                            ) : analysisResult ? (
                                <div className="space-y-3">
                                    {analysisResult.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center group hover:border-blue-300 transition-colors">
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.test_name}</p>
                                                <p className="text-xs text-gray-500">Ref: {item.reference_range || 'N/A'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{item.result_value} <span className="text-xs font-normal text-gray-500">{item.unit}</span></p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.status?.toLowerCase() === 'normal'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <FileText size={48} className="mb-2 opacity-50" />
                                    <p>Results will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!analysisResult}
                        className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all sm:w-auto w-full"
                    >
                        Save to Records
                    </button>
                </div>
            </div>
        </div>
    );
};
