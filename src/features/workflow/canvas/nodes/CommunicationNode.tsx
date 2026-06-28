
import { Handle, Position } from '@xyflow/react';
import { Mail, MessageCircle, Smartphone, AlertCircle } from 'lucide-react';

const channels: Record<string, any> = {
    'email': { icon: Mail, label: 'Email', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    'whatsapp': { icon: MessageCircle, label: 'WhatsApp', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    'sms': { icon: Smartphone, label: 'SMS', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    'default': { icon: MessageCircle, label: 'Message', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
};

export default function CommunicationNode({ data, selected }: { data: any, selected: boolean }) {
    const channelType = data.channel || 'default';
    const config = channels[channelType] || channels['default'];
    const Icon = config.icon;

    return (
        <div className={`
            bg-white rounded-xl shadow-lg p-3 min-w-[220px] transition-all duration-200
            border-2 ${selected ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-100 hover:border-gray-200'}
        `}>
            {/* Header / Type Badge */}
            <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                    {config.label}
                </span>
                {data.templateId && (
                    <span className="text-[10px] text-gray-400 font-mono">
                        #{data.templateId.slice(0, 4)}
                    </span>
                )}
            </div>

            <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg ${config.bg} ${config.color} shadow-sm`}>
                    <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                        {data.label || 'Send Message'}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {data.description || 'Configure message details...'}
                    </p>
                </div>
            </div>

            {/* Error Indicator (Placeholder logic) */}
            {data.hasError && (
                <div className="absolute -top-1 -right-1">
                    <div className="bg-red-500 text-white rounded-full p-1 shadow-sm">
                        <AlertCircle size={10} />
                    </div>
                </div>
            )}

            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-slate-400 border-2 border-white transition-colors hover:bg-teal-500"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-slate-400 border-2 border-white transition-colors hover:bg-teal-500"
            />
        </div>
    );
}
