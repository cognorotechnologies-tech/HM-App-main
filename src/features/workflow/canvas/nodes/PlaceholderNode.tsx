import { Handle, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';

export default function PlaceholderNode() {
    return (
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus size={16} className="text-gray-400" />

            <Handle type="target" position={Position.Top} className="opacity-0" />
        </div>
    );
}
