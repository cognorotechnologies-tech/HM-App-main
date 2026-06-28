import { useState } from 'react';
import { X, Play, RefreshCw, Settings, Save, Terminal, User, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { replaceVariables } from '../../../utils/templateUtils';

interface WorkflowSimulatorProps {
    steps: any[];
    onClose: () => void;
}

const DEFAULT_CONTEXT = {
    patient: {
        name: 'Alex Johnson',
        first_name: 'Alex',
        email: 'alex.j@example.com',
        phone: '+1 (555) 123-4567'
    },
    doctor: {
        name: 'Dr. Sarah Smith',
        specialization: 'Cardiology'
    },
    workflow: {
        name: 'Post-Surgery Care',
        start_date: new Date().toLocaleDateString()
    }
};

interface LogEntry {
    id: string;
    stepId: string;
    timestamp: Date;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    stepType?: string;
    details?: any;
}

export default function WorkflowSimulator({ steps, onClose }: WorkflowSimulatorProps) {
    const [activeTab, setActiveTab] = useState<'run' | 'config'>('run');
    const [testContext, setTestContext] = useState(DEFAULT_CONTEXT);
    const [contextJson, setContextJson] = useState(JSON.stringify(DEFAULT_CONTEXT, null, 4));

    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);

    const addLog = (type: LogEntry['type'], message: string, details?: any, stepId: string = 'system', stepType?: string) => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            stepId,
            type,
            message,
            stepType,
            details
        }]);
    };

    const handleSaveContext = () => {
        try {
            const parsed = JSON.parse(contextJson);
            setTestContext(parsed);
            setActiveTab('run');
            addLog('info', 'Test Data Updated', parsed);
        } catch (e) {
            alert('Invalid JSON format');
        }
    };

    const runSimulation = async () => {
        setIsRunning(true);
        setLogs([]);
        setCurrentStepIndex(-1);

        addLog('info', 'Starting Workflow Simulation...', null);
        addLog('info', `Loaded Context for: ${testContext.patient.name}`, testContext);

        const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);

        if (sortedSteps.length === 0) {
            addLog('warning', 'No steps defined.');
            setIsRunning(false);
            return;
        }

        for (let i = 0; i < sortedSteps.length; i++) {
            const step = sortedSteps[i];
            setCurrentStepIndex(i);

            // Artificial delay for visualization
            await new Promise(r => setTimeout(r, 800));

            try {
                switch (step.step_type) {
                    case 'send_message':
                        const messageConfig = step.action_config || {};
                        const rawMessage = messageConfig.message || '(No message content)';
                        const parsedMessage = replaceVariables(rawMessage, testContext);

                        addLog('success', `Message Sent`, {
                            original: rawMessage,
                            parsed: parsedMessage,
                            to: testContext.patient.email,
                            channel: 'Email'
                        }, step.id, 'send_message');
                        break;

                    case 'send_survey':
                        addLog('success', `Survey Triggered`, {
                            survey_template: step.action_config?.survey_template_id || 'N/A',
                            recipient: testContext.patient.email
                        }, step.id, 'send_survey');
                        break;

                    case 'delay':
                        const delayDays = step.delay_days || 0;
                        addLog('info', `Delay Skipped`, {
                            duration: `${delayDays} Days`,
                            note: 'Simulation Mode'
                        }, step.id, 'delay');
                        break;

                    case 'create_task':
                        const taskConfig = step.action_config || {};
                        const taskTitle = replaceVariables(taskConfig.task_title || '', testContext);
                        addLog('success', `Task Created`, {
                            title: taskTitle,
                            assigned_to: taskConfig.assigned_role || 'Staff',
                            priority: 'Medium'
                        }, step.id, 'create_task');
                        break;

                    default:
                        addLog('warning', `Unknown Step Type: ${step.step_type}`, null, step.id);
                }
            } catch (err: any) {
                addLog('error', `Step Failed: ${err.message}`, null, step.id);
            }
        }

        addLog('success', 'Workflow Simulation Completed.');
        setIsRunning(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Terminal size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Workflow Simulator</h2>
                            <p className="text-xs text-gray-500">Test mode environment</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-200/50 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('run')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'run' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Play size={14} className="inline mr-1.5" />
                            Run
                        </button>
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'config' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Settings size={14} className="inline mr-1.5" />
                            Test Data
                        </button>
                    </div>

                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden relative">

                    {/* CONFIGURATION TAB */}
                    {activeTab === 'config' && (
                        <div className="absolute inset-0 bg-white p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4">
                            <div className="max-w-2xl mx-auto">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User size={20} className="text-indigo-600" />
                                    Configure Test Context
                                </h3>
                                <p className="text-gray-500 mb-6 text-sm">
                                    Edit the JSON data below. These variables (e.g., <code>{`{{patient.name}}`}</code>) will be populated in your workflow steps during simulation.
                                </p>

                                <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-slate-50">
                                    <div className="bg-slate-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                        <span className="text-xs font-mono text-gray-500">context.json</span>
                                        <button
                                            onClick={() => setContextJson(JSON.stringify(DEFAULT_CONTEXT, null, 4))}
                                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            Reset to Default
                                        </button>
                                    </div>
                                    <textarea
                                        value={contextJson}
                                        onChange={(e) => setContextJson(e.target.value)}
                                        className="w-full h-[400px] p-4 font-mono text-sm bg-slate-50 focus:outline-none focus:bg-white transition-colors text-slate-700"
                                        spellCheck={false}
                                    />
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleSaveContext}
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center gap-2 shadow-lg shadow-indigo-200"
                                    >
                                        <Save size={18} />
                                        Save & Switch to Run
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RUN TAB */}
                    {activeTab === 'run' && (
                        <div className="flex h-full">
                            {/* Left: Visualization */}
                            <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Execution</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${isRunning ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
                                        {isRunning ? 'RUNNING' : 'IDLE'}
                                    </span>
                                </div>

                                <div className="space-y-4 relative">
                                    {/* Connection Line */}
                                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 z-0" />

                                    {steps.sort((a, b) => a.step_order - b.step_order).map((step, idx) => (
                                        <div
                                            key={step.id || idx}
                                            className={`
                                                relative z-10 pl-12 transition-all duration-500
                                                ${idx === currentStepIndex ? 'opacity-100 translate-x-1' : 'opacity-60'}
                                            `}
                                        >
                                            {/* Status Dot */}
                                            <div className={`
                                                absolute left-2 top-3 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white transition-colors duration-300
                                                ${idx === currentStepIndex
                                                    ? 'border-indigo-500 text-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.2)]'
                                                    : idx < currentStepIndex
                                                        ? 'border-green-500 text-green-500 bg-green-50'
                                                        : 'border-gray-300 text-gray-300'}
                                            `}>
                                                {idx < currentStepIndex ? <CheckCircle size={14} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                                            </div>

                                            {/* Card */}
                                            <div className={`
                                                p-3 rounded-xl border bg-white transition-all
                                                ${idx === currentStepIndex ? 'border-indigo-200 shadow-md ring-1 ring-indigo-100' : 'border-gray-200'}
                                            `}>
                                                <p className="text-sm font-semibold text-gray-900">{step.step_name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{step.step_type.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Console & Previews */}
                            <div className="flex-1 bg-slate-900 text-slate-200 flex flex-col">
                                <div className="p-3 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                                    <span className="text-xs font-mono text-slate-400">CONSOLE OUTPUT</span>
                                    <div className="flex gap-2">
                                        <span className="text-xs px-2 py-1 rounded bg-slate-700 border border-slate-600 text-slate-300">
                                            Role: {testContext.patient.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {logs.length === 0 && !isRunning && (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-40">
                                            <Terminal size={48} className="mb-4" />
                                            <p>Ready to simulate</p>
                                        </div>
                                    )}

                                    {logs.map((log) => (
                                        <div key={log.id} className="animate-in fade-in slide-in-from-left-4 duration-300">
                                            <div className="flex gap-4">
                                                <span className="text-xs font-mono text-slate-500 pt-1 flex-shrink-0">
                                                    {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {log.type === 'info' && <span className="text-blue-400 text-xs font-bold uppercase">INFO</span>}
                                                        {log.type === 'success' && <span className="text-green-400 text-xs font-bold uppercase">SUCCESS</span>}
                                                        {log.type === 'warning' && <span className="text-yellow-400 text-xs font-bold uppercase">WARN</span>}
                                                        {log.type === 'error' && <span className="text-red-400 text-xs font-bold uppercase">ERROR</span>}

                                                        <span className="text-slate-300 text-sm font-medium">{log.message}</span>
                                                    </div>

                                                    {/* RICH PREVIEWS */}
                                                    {log.stepType === 'send_message' && log.details?.parsed && (
                                                        <div className="mt-3 bg-white rounded-lg overflow-hidden border border-slate-700 shadow-lg max-w-md">
                                                            <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                                                                <Mail size={14} className="text-gray-500" />
                                                                <span className="text-xs text-gray-600 font-medium">Email Preview</span>
                                                            </div>
                                                            <div className="p-4 text-gray-800 text-sm whitespace-pre-wrap font-sans">
                                                                {log.details.parsed}
                                                            </div>
                                                            <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
                                                                <span>To: {log.details.to}</span>
                                                                <span>Sent via Hospital System</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Standard Details */}
                                                    {log.details && log.stepType !== 'send_message' && (
                                                        <div className="mt-2 text-xs font-mono bg-black/30 p-3 rounded-lg border border-slate-700/50 text-slate-400 overflow-x-auto">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {isRunning && (
                                        <div className="pl-16">
                                            <div className="h-4 w-2 bg-indigo-500 animate-pulse rounded-sm"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'run' && (
                    <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 z-10">
                        <button
                            onClick={runSimulation}
                            disabled={isRunning}
                            className={`
                                px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all
                                ${isRunning
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
                                }
                            `}
                        >
                            {isRunning ? (
                                <><RefreshCw className="animate-spin" size={18} /> Simulating...</>
                            ) : (
                                <><Play size={18} /> {logs.length > 0 ? 'Run Again' : 'Run Simulation'}</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
