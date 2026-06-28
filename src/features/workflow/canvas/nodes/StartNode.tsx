import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export default function StartNode({ data }: { data: { label: string } }) {
    return (
        <div className="bg-white border-2 border-teal-500 rounded-xl shadow-md p-3 min-w-[200px]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
                    <Play size={20} className="fill-current" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Start</h3>
                    <p className="text-xs text-gray-500">{data.label}</p>
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-teal-500 border-2 border-white"
            />
        </div>
    );
}
