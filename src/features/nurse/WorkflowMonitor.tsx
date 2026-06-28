import { useEffect, useState } from 'react';
import { workflowService } from '../../services/workflowService';
import { Clock, AlertTriangle, CheckCircle, Play, Pause, XCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import WorkflowExecutionDetail from './WorkflowExecutionDetail';

interface WorkflowStatusDisplay {
    id: string;
    workflowName: string;
    patientName: string;
    patientId: string;
    status: 'active' | 'paused' | 'failed' | 'completed' | 'waiting';
    currentStep: string;
    nextExecutionAt?: string;
    errorMessage?: string;
    progress: number;
}

export default function WorkflowMonitor() {
    const toast = useToast();
    const [workflows, setWorkflows] = useState<WorkflowStatusDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

    useEffect(() => {
        loadWorkflows();

        // Refresh every 15 seconds
        const interval = setInterval(loadWorkflows, 15000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const loadWorkflows = async () => {
        try {
            setLoading(false); // Don't show loading on refreshes

            // Get workflows that are active, paused, or failed (not completed/cancelled)
            const instances = await workflowService.getWorkflowsForExecution();

            if (!instances || instances.length === 0) {
                setWorkflows([]);
                return;
            }

            // Transform to display format
            const displayData: WorkflowStatusDisplay[] = instances.map((instance: any) => {
                const currentStepName = instance.workflow_steps?.step_name || 'Starting...';

                // Calculate progress (rough estimate based on current step order)
                const progress = instance.status === 'completed' ? 100 :
                    instance.status === 'failed' ? 50 :
                        instance.current_step_id ? 30 : 10;

                return {
                    id: instance.id,
                    workflowName: instance.workflow_templates?.name || 'Unknown Workflow',
                    patientName: instance.patients
                        ? `${instance.patients.first_name || ''} ${instance.patients.last_name || ''}`.trim()
                        : 'Unknown Patient',
                    patientId: instance.patient_id,
                    status: instance.status || 'waiting',
                    currentStep: currentStepName,
                    nextExecutionAt: instance.next_execution_at,
                    errorMessage: instance.error_message,
                    progress
                };
            });

            setWorkflows(displayData);
        } catch (error) {
            console.error('Failed to load workflows:', error);
            toast.error('Failed to load workflows');
        }
    };

    const handlePause = async (workflowId: string) => {
        try {
            await workflowService.pauseWorkflow(workflowId);
            toast.success('Workflow paused');
            loadWorkflows();
        } catch (error) {
            console.error('Failed to pause workflow:', error);
            toast.error('Failed to pause workflow');
        }
    };

    const handleResume = async (workflowId: string) => {
        try {
            await workflowService.resumeWorkflow(workflowId);
            toast.success('Workflow resumed');
            loadWorkflows();
        } catch (error) {
            console.error('Failed to resume workflow:', error);
            toast.error('Failed to resume workflow');
        }
    };

    const handleRetry = async (workflowId: string) => {
        try {
            await workflowService.resumeWorkflow(workflowId);
            toast.success('Retrying workflow...');
            loadWorkflows();
        } catch (error) {
            console.error('Failed to retry workflow:', error);
            toast.error('Failed to retry workflow');
        }
    };

    const handleCancel = async (workflowId: string) => {
        if (!confirm('Are you sure you want to cancel this workflow?')) {
            return;
        }

        try {
            await workflowService.cancelWorkflow(workflowId);
            toast.success('Workflow cancelled');
            loadWorkflows();
        } catch (error) {
            console.error('Failed to cancel workflow:', error);
            toast.error('Failed to cancel workflow');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-100 border-blue-500 text-blue-900';
            case 'paused': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
            case 'failed': return 'bg-red-100 border-red-500 text-red-900';
            case 'completed': return 'bg-green-100 border-green-500 text-green-900';
            case 'waiting': return 'bg-purple-100 border-purple-500 text-purple-900';
            default: return 'bg-gray-100 border-gray-500 text-gray-900';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Play className="w-5 h-5" />;
            case 'paused': return <Pause className="w-5 h-5" />;
            case 'failed': return <XCircle className="w-5 h-5" />;
            case 'completed': return <CheckCircle className="w-5 h-5" />;
            case 'waiting': return <Clock className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Active Workflows</h2>
                        <p className="text-sm text-gray-600 mt-1">Monitor and manage workflow execution</p>
                    </div>
                    <button
                        onClick={loadWorkflows}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {workflows.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-600 font-semibold">No active workflows</p>
                        <p className="text-gray-500 text-sm mt-2">All workflows are running smoothly!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {workflows.map((workflow) => (
                            <div
                                key={workflow.id}
                                onClick={() => setSelectedWorkflowId(workflow.id)}
                                className={`border-2 rounded-xl p-4 transition-all cursor-pointer hover:shadow-lg ${getStatusColor(workflow.status)}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        {getStatusIcon(workflow.status)}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{workflow.workflowName}</h3>
                                            <p className="text-sm text-gray-600">Patient: {workflow.patientName}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-white/50 rounded-full text-xs font-semibold capitalize">
                                        {workflow.status}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{workflow.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all"
                                            style={{ width: `${workflow.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-sm mb-4">
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Current Step:</span> {workflow.currentStep}
                                    </p>
                                    {workflow.nextExecutionAt && (
                                        <p className="text-gray-600 mt-1">
                                            <span className="font-semibold">Next Execution:</span>{' '}
                                            {new Date(workflow.nextExecutionAt).toLocaleString()}
                                        </p>
                                    )}
                                    {workflow.errorMessage && (
                                        <p className="text-red-600 mt-2 flex items-start gap-2 bg-red-50 p-2 rounded">
                                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{workflow.errorMessage}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    {workflow.status === 'active' && (
                                        <button
                                            onClick={() => handlePause(workflow.id)}
                                            className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all flex items-center gap-2 text-sm"
                                        >
                                            <Pause className="w-4 h-4" />
                                            Pause
                                        </button>
                                    )}

                                    {(workflow.status === 'paused' || workflow.status === 'waiting') && (
                                        <button
                                            onClick={() => handleResume(workflow.id)}
                                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm"
                                        >
                                            <Play className="w-4 h-4" />
                                            Resume
                                        </button>
                                    )}

                                    {workflow.status === 'failed' && (
                                        <button
                                            onClick={() => handleRetry(workflow.id)}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Retry
                                        </button>
                                    )}

                                    {workflow.status !== 'completed' && (
                                        <button
                                            onClick={() => handleCancel(workflow.id)}
                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Execution Detail Modal */}
            {
                selectedWorkflowId && (
                    <WorkflowExecutionDetail
                        instanceId={selectedWorkflowId}
                        onClose={() => setSelectedWorkflowId(null)}
                    />
                )
            }
        </>
    );
}
