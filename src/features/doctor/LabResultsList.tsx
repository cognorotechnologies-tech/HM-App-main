import React, { useEffect, useState } from 'react';
import { FileText, Calendar, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { labResultService, LabResult } from '../../services/labResultService';

interface LabResultsListProps {
    patientId: string;
    refreshTrigger: number;
}

export const LabResultsList: React.FC<LabResultsListProps> = ({ patientId, refreshTrigger }) => {
    const [results, setResults] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    useEffect(() => {
        fetchResults();
    }, [patientId, refreshTrigger]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const data = await labResultService.getByPatient(patientId);
            setResults(data);
        } catch (error) {
            console.error('Failed to fetch lab results', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (loading) return <div className="text-center py-4 text-gray-400 text-xs">Loading lab results...</div>;

    if (results.length === 0) return null; // Don't show if empty to avoid clutter

    return (
        <div className="space-y-3 mb-6">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Activity size={16} className="text-purple-600" />
                Latest Lab Results
            </h3>
            <div className="space-y-2">
                {results.map(result => (
                    <div key={result.id} className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                        <div
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleExpand(result.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md ${result.status === 'reviewed' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{result.test_type}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar size={10} />
                                        {new Date(result.test_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
                                    {result.status}
                                </span>
                                {expandedIds.includes(result.id) ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                            </div>
                        </div>

                        {expandedIds.includes(result.id) && result.raw_data && (
                            <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-sm">
                                <div className="space-y-2">
                                    {(Array.isArray(result.raw_data) ? result.raw_data : []).map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                                            <span className="text-gray-600 font-medium">{item.test_name}</span>
                                            <div className="text-right">
                                                <span className="font-bold text-gray-800 mr-2">{item.result_value} <span className="text-xs font-normal text-gray-500">{item.unit}</span></span>
                                                {item.status && item.status.toLowerCase() !== 'normal' && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
                                                        {item.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {result.summary && (
                                    <div className="mt-3 text-xs text-gray-600 italic bg-purple-50 p-2 rounded border border-purple-100">
                                        "{result.summary}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
