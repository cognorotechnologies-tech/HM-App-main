// @ts-nocheck
// Data Migration UI Component
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle, XCircle, Clock, Users, Activity, Trash2, Eye } from 'lucide-react';
import api from '../lib/axios';

interface ImportJob {
    id: number;
    import_type: string;
    file_name: string;
    file_size: number;
    total_rows: number;
    processed_rows: number;
    successful_rows: number;
    failed_rows: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    dry_run: boolean;
    started_at: string | null;
    completed_at: string | null;
    error_summary: any;
    created_by: number;
    created_at: string;
}

interface ImportLogDetail {
    id: number;
    import_job_id: number;
    row_number: number;
    status: 'success' | 'error';
    error_message: string | null;
    processed_data: any;
    created_at: string;
}

export const DataMigrationUI: React.FC = () => {
    const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importType, setImportType] = useState<'patients' | 'doctors' | 'appointments'>('patients');
    const [dryRun, setDryRun] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);
    const [jobLogs, setJobLogs] = useState<ImportLogDetail[]>([]);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchImportJobs();
    }, []);

    const fetchImportJobs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/data-migration/jobs');
            setImportJobs(response.data);
        } catch (err: any) {
            console.error('Error fetching import jobs:', err);
            setError('Failed to load import jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.csv')) {
                setError('Please select a CSV file');
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        try {
            setUploading(true);
            setError('');

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('importType', importType);
            formData.append('dryRun', dryRun.toString());

            const response = await api.post('/data-migration/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Refresh the jobs list
            await fetchImportJobs();

            // Reset form
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            alert(`Import ${dryRun ? 'validation' : 'job'} started successfully!`);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const viewJobLogs = async (job: ImportJob) => {
        try {
            setSelectedJob(job);
            setShowLogsModal(true);
            const response = await api.get(`/data-migration/jobs/${job.id}/logs`);
            setJobLogs(response.data);
        } catch (err: any) {
            console.error('Error fetching job logs:', err);
            setError('Failed to load job logs');
        }
    };

    const deleteJob = async (jobId: number) => {
        if (!confirm('Are you sure you want to delete this import job?')) return;

        try {
            await api.delete(`/data-migration/jobs/${jobId}`);
            await fetchImportJobs();
        } catch (err: any) {
            console.error('Error deleting job:', err);
            setError('Failed to delete job');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="text-green-600" size={20} />;
            case 'failed': return <XCircle className="text-red-600" size={20} />;
            case 'processing': return <Activity className="text-blue-600 animate-spin" size={20} />;
            case 'pending': return <Clock className="text-yellow-600" size={20} />;
            default: return <AlertCircle className="text-gray-600" size={20} />;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: string } = {
            completed: 'bg-green-100 text-green-700',
            failed: 'bg-red-100 text-red-700',
            processing: 'bg-blue-100 text-blue-700',
            pending: 'bg-yellow-100 text-yellow-700',
            cancelled: 'bg-gray-100 text-gray-700',
        };
        return `px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Upload className="text-indigo-600" size={36} />
                        Data Migration & Import
                    </h1>
                    <p className="text-gray-600">Upload CSV files to bulk import patients, doctors, or appointments</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={20} />
                        <p className="text-red-700">{error}</p>
                        <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">
                            <XCircle size={18} />
                        </button>
                    </div>
                )}

                {/* Upload Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FileText className="text-indigo-600" />
                        Upload CSV File
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Import Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Import Type
                            </label>
                            <select
                                value={importType}
                                onChange={(e) => setImportType(e.target.value as any)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="patients">Patients</option>
                                <option value="doctors">Doctors</option>
                                <option value="appointments">Appointments</option>
                            </select>
                        </div>

                        {/* Dry Run Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mode
                            </label>
                            <div className="flex items-center gap-4 h-12">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={dryRun}
                                        onChange={(e) => setDryRun(e.target.checked)}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">Dry Run (Validation Only)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* File Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            CSV File
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            {selectedFile && (
                                <div className="text-sm text-gray-600">
                                    {formatFileSize(selectedFile.size)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Activity className="animate-spin" size={20} />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={20} />
                                {dryRun ? 'Validate Import' : 'Start Import'}
                            </>
                        )}
                    </button>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Import Guidelines:</h4>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>CSV files must have headers matching the required fields</li>
                            <li>Dry run mode will validate data without inserting into database</li>
                            <li>Maximum file size: 10MB</li>
                            <li>Check the logs after import to see detailed results</li>
                        </ul>
                    </div>
                </div>

                {/* Import Jobs List */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-indigo-600" />
                            Import History
                        </h2>
                        <button
                            onClick={fetchImportJobs}
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : importJobs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <p>No import jobs yet. Upload a CSV file to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">File</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Progress</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Success/Failed</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {importJobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(job.status)}
                                                    <span className={getStatusBadge(job.status)}>
                                                        {job.dry_run && '(Dry Run) '}{job.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-medium text-gray-900 capitalize">{job.import_type}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">{job.file_name}</div>
                                                    <div className="text-gray-500">{formatFileSize(job.file_size)}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {job.processed_rows} / {job.total_rows} rows
                                                    </div>
                                                    {job.total_rows > 0 && (
                                                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                                                            <div
                                                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                                                style={{ width: `${(job.processed_rows / job.total_rows) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm">
                                                    <div className="text-green-600 font-medium">✓ {job.successful_rows}</div>
                                                    <div className="text-red-600 font-medium">✗ {job.failed_rows}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {formatDate(job.created_at)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => viewJobLogs(job)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="View Logs"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteJob(job.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Job"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Logs Modal */}
                {showLogsModal && selectedJob && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
                                <h3 className="text-2xl font-bold">Import Job Logs: {selectedJob.file_name}</h3>
                                <button
                                    onClick={() => setShowLogsModal(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {jobLogs.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No logs available</p>
                                ) : (
                                    <div className="space-y-3">
                                        {jobLogs.map((log) => (
                                            <div
                                                key={log.id}
                                                className={`p-4 rounded-lg border ${log.status === 'success'
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-red-50 border-red-200'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-900">
                                                        Row {log.row_number}
                                                    </span>
                                                    <span className={`text-sm font-medium ${log.status === 'success' ? 'text-green-700' : 'text-red-700'
                                                        }`}>
                                                        {log.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                {log.error_message && (
                                                    <p className="text-sm text-red-700 mb-2">{log.error_message}</p>
                                                )}
                                                {log.processed_data && (
                                                    <details className="text-sm text-gray-700">
                                                        <summary className="cursor-pointer font-medium">View Data</summary>
                                                        <pre className="mt-2 bg-white p-2 rounded overflow-x-auto">
                                                            {JSON.stringify(log.processed_data, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataMigrationUI;
