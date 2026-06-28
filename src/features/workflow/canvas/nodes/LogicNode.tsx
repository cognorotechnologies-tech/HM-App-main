
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Check, X } from 'lucide-react';

export default function LogicNode({ data, selected }: { data: any, selected: boolean }) {
    return (
        <div className={`
            bg-white rounded-lg shadow-md p-0 min-w-[200px] transition-all duration-200
            border-2 ${selected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-100 hover:border-amber-200'}
        `}>
            {/* Header */}
            <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 rounded-t-lg flex items-center gap-2">
                <GitBranch size={16} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Condition</span>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1 text-center">
                    {data.label || 'Check Condition'}
                </h3>
                {data.condition && (
                    <p className="text-xs text-gray-500 text-center font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        {data.condition}
                    </p>
                )}
            </div>

            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-slate-400 border-2 border-white"
            />

            {/* Branching Outputs */}
            <div className="flex justify-between px-4 pb-4 w-full">
                <div className="relative">
                    <span className="text-[10px] font-bold text-green-600 block mb-1 text-center">TRUE</span>
                    <Handle
                        id="true"
                        type="source"
                        position={Position.Bottom}
                        className="w-3 h-3 bg-green-500 border-2 border-white !relative !transform-none !left-0 !top-0 mx-auto"
                        style={{ left: 'auto', right: 'auto' }}
                    />
                </div>

                <div className="relative">
                    <span className="text-[10px] font-bold text-red-500 block mb-1 text-center">FALSE</span>
                    <Handle
                        id="false"
                        type="source"
                        position={Position.Bottom}
                        className="w-3 h-3 bg-red-500 border-2 border-white !relative !transform-none !left-0 !top-0 mx-auto"
                        style={{ left: 'auto', right: 'auto' }}
                    />
                </div>
            </div>
        </div>
    );
}
