import React, { useEffect, useState } from 'react';
import { workflowService } from '../../services/workflowService';
import { Play, CheckCircle2, Loader2, FileText, Activity } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface CarePlanSelectorProps {
    patientId: string;
    onEnroll: () => void;
}

export const CarePlanSelector: React.FC<CarePlanSelectorProps> = ({ patientId, onEnroll }) => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, [patientId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [templatesData, workflowsData] = await Promise.all([
                workflowService.getTemplates(),
                workflowService.getPatientWorkflows(patientId, 'active')
            ]);

            setTemplates(templatesData || []);
            setActiveWorkflows(workflowsData || []);
        } catch (error) {
            console.error('Failed to load care plans', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (templateId: string, templateName: string) => {
        try {
            setEnrolling(templateId);
            await workflowService.createInstance({
                workflow_id: templateId,
                patient_id: patientId
            });
            toast.success(`Patient enrolled in ${templateName} successfully`);

            // Refresh list to show active status
            const workflowsData = await workflowService.getPatientWorkflows(patientId, 'active');
            setActiveWorkflows(workflowsData || []);

            onEnroll();
        } catch (error) {
            console.error(error);
            toast.error('Failed to enroll patient');
        } finally {
            setEnrolling(null);
        }
    };

    const isEnrolled = (templateId: string) => {
        return activeWorkflows.some(wf => wf.workflow_id === templateId || wf.workflow_template_id === templateId);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-6 gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span className="text-xs">Loading plans...</span>
        </div>
    );

    if (templates.length === 0) return (
        <div className="p-4 text-center text-gray-500 text-xs border border-dashed border-gray-200 rounded-lg bg-gray-50">
            No active care plan templates available.
            <br />
            <span className="opacity-75">Create templates in Admin Dashboard.</span>
        </div>
    );

    return (
        <div className="space-y-3 max-h-[300px] overflow-y-auto px-1">
            {templates.map(template => {
                const enrolled = isEnrolled(template.id);
                return (
                    <div
                        key={template.id}
                        className={`p-3 border rounded-lg flex items-center justify-between transition-all group ${enrolled
                                ? 'bg-green-50 border-green-200 shadow-sm'
                                : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-sm'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md transition-colors ${enrolled
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                                }`}>
                                {enrolled ? <Activity size={16} /> : <FileText size={16} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className={`font-medium text-sm ${enrolled ? 'text-green-900' : 'text-gray-900'}`}>
                                        {template.name}
                                    </p>
                                    {enrolled && (
                                        <span className="px-1.5 py-0.5 bg-green-200 text-green-800 text-[10px] font-bold rounded-full uppercase tracking-wide">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-1">
                                    {template.description || 'Automated care workflow'}
                                </p>
                            </div>
                        </div>

                        {!enrolled ? (
                            <button
                                onClick={() => handleEnroll(template.id, template.name)}
                                disabled={!!enrolling}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                                title="Enroll in Plan"
                            >
                                {enrolling === template.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <>
                                        Enroll <Play size={12} className="ml-1" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="text-green-600 flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-green-100 rounded-lg">
                                <CheckCircle2 size={14} />
                                Enrolled
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
