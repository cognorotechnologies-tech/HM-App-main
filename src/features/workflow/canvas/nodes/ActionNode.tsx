import { Handle, Position } from '@xyflow/react';
import { MessageSquare, FileText, Clock, AlertTriangle, CheckSquare } from 'lucide-react';

const icons: Record<string, any> = {
    'send_message': { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    'send_survey': { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    'delay': { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    'create_task': { icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'default': { icon: AlertTriangle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
};

export default function ActionNode({ data, selected }: { data: any, selected: boolean }) {
    const type = data.step_type || 'default';
    const config = icons[type] || icons['default'];
    const Icon = config.icon;

    return (
        <div className={`
            bg-white rounded-xl shadow-sm p-4 min-w-[250px] transition-all duration-200
            border-2 ${selected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-gray-300'}
        `}>
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${config.bg} ${config.color}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                        {data.label}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                        {data.description || 'Configure this step...'}
                    </p>
                </div>
            </div>

            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-gray-400 border-2 border-white"
            />

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-gray-400 border-2 border-white"
            />
        </div>
    );
}
