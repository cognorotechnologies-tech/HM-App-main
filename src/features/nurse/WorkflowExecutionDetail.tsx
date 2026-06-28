import { useEffect, useState } from 'react';
import { workflowService } from '../../services/workflowService';
import {
    X, Clock, CheckCircle, XCircle, Calendar, User,
    FileText, AlertTriangle, Zap, Play, Pause
} from 'lucide-react';

interface ExecutionStep {
    id: string;
    step_name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    started_at?: string;
    completed_at?: string;
    execution_time?: number;
    error_message?: string;
    output_data?: any;
}

interface WorkflowInstance {
    id: string;
    workflow_templates?: {
        name: string;
        description?: string;
    };
    patients?: {
        first_name: string;
        last_name: string;
    };
    status: string;
    created_at: string;
    completed_at?: string;
    trigger_event: string;
    trigger_data?: any;
    error_message?: string;
}

interface WorkflowExecutionDetailProps {
    instanceId: string;
    onClose: () => void;
}

export default function WorkflowExecutionDetail({ instanceId, onClose }: WorkflowExecutionDetailProps) {
    const [instance, setInstance] = useState<WorkflowInstance | null>(null);
    const [executionHistory, setExecutionHistory] = useState<ExecutionStep[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDetails();
    }, [instanceId]);

    const loadDetails = async () => {
        try {
            setLoading(true);

            // Get execution history
            const history = await workflowService.getExecutionHistory(instanceId);
            setExecutionHistory(history || []);

            // Get instance details by fetching all workflows and finding this one
            const allWorkflows = await workflowService.getWorkflowsForExecution();
            const foundInstance = allWorkflows.find((w: any) => w.id === instanceId);

            if (foundInstance) {
                setInstance(foundInstance);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to load workflow details:', error);
            setLoading(false);
        }
    };

    const getStepIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-6 h-6 text-green-600" />;
            case 'failed': return <XCircle className="w-6 h-6 text-red-600" />;
            case 'running': return <Play className="w-6 h-6 text-blue-600 animate-pulse" />;
            case 'pending': return <Clock className="w-6 h-6 text-gray-400" />;
            default: return <Clock className="w-6 h-6 text-gray-400" />;
        }
    };

    const getStepColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-50 border-green-200';
            case 'failed': return 'bg-red-50 border-red-200';
            case 'running': return 'bg-blue-50 border-blue-200';
            case 'pending': return 'bg-gray-50 border-gray-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}min`;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!instance) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-center mb-4">Workflow Not Found</h2>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const patientName = instance.patients
        ? `${instance.patients.first_name} ${instance.patients.last_name}`
        : 'Unknown Patient';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">
                                {instance.workflow_templates?.name || 'Workflow Execution'}
                            </h2>
                            <p className="text-purple-100 text-sm">
                                {instance.workflow_templates?.description || 'Workflow execution details'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Instance Info */}
                    <div className="grid grid-cols-2 gap-4 mt-6 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <div>
                                <p className="text-xs text-purple-200">Patient</p>
                                <p className="font-semibold">{patientName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            <div>
                                <p className="text-xs text-purple-200">Status</p>
                                <p className="font-semibold capitalize">{instance.status}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <div>
                                <p className="text-xs text-purple-200">Started</p>
                                <p className="font-semibold text-sm">
                                    {new Date(instance.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            <div>
                                <p className="text-xs text-purple-200">Trigger</p>
                                <p className="font-semibold capitalize">{instance.trigger_event.replace(/_/g, ' ')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Global Error Message */}
                    {instance.error_message && (
                        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-red-900 mb-1">Workflow Error</h3>
                                    <p className="text-red-700">{instance.error_message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Execution Timeline */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-600" />
                            Execution Timeline
                        </h3>

                        {executionHistory.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600">No execution history available</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    This workflow hasn't executed any steps yet
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {executionHistory.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`border-2 rounded-xl p-4 transition-all ${getStepColor(step.status)}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Step Number & Icon */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-full bg-white border-2 border-current flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                {index < executionHistory.length - 1 && (
                                                    <div className="w-1 h-8 bg-gray-300 my-1"></div>
                                                )}
                                            </div>

                                            {/* Step Content */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {getStepIcon(step.status)}
                                                        <h4 className="font-bold text-gray-900">
                                                            {step.step_name}
                                                        </h4>
                                                    </div>
                                                    <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold capitalize">
                                                        {step.status}
                                                    </span>
                                                </div>

                                                {/* Timestamps */}
                                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                                    {step.started_at && (
                                                        <div className="text-gray-600">
                                                            <span className="font-semibold">Started:</span>{' '}
                                                            {new Date(step.started_at).toLocaleString()}
                                                        </div>
                                                    )}
                                                    {step.completed_at && (
                                                        <div className="text-gray-600">
                                                            <span className="font-semibold">Completed:</span>{' '}
                                                            {new Date(step.completed_at).toLocaleString()}
                                                        </div>
                                                    )}
                                                    {step.execution_time && (
                                                        <div className="text-gray-600">
                                                            <span className="font-semibold">Duration:</span>{' '}
                                                            {formatDuration(step.execution_time)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Error Message */}
                                                {step.error_message && (
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 mt-2">
                                                        <p className="text-red-800 text-sm font-semibold mb-1">
                                                            Error:
                                                        </p>
                                                        <p className="text-red-700 text-sm">
                                                            {step.error_message}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Output Data */}
                                                {step.output_data && (
                                                    <details className="mt-2">
                                                        <summary className="cursor-pointer text-sm font-semibold text-purple-600 hover:text-purple-700">
                                                            View Output Data
                                                        </summary>
                                                        <pre className="mt-2 bg-gray-100 rounded p-3 text-xs overflow-x-auto">
                                                            {JSON.stringify(step.output_data, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Trigger Data */}
                    {instance.trigger_data && Object.keys(instance.trigger_data).length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Trigger Data</h3>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <pre className="text-sm overflow-x-auto">
                                    {JSON.stringify(instance.trigger_data, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
