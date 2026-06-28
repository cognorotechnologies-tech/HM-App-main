
import { Handle, Position } from '@xyflow/react';
import { Clock, Hourglass, CalendarClock } from 'lucide-react';

export default function DelayNode({ data, selected }: { data: any, selected: boolean }) {
    return (
        <div className={`
            bg-white rounded-full shadow-sm px-6 py-3 min-w-[150px] flex items-center justify-center gap-3 transition-all duration-200
            border-2 ${selected ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-orange-100 hover:border-orange-200'}
        `}>
            <div className="p-1.5 bg-orange-100 rounded-full text-orange-600">
                <Hourglass size={16} />
            </div>

            <div className="text-center">
                <span className="block text-xs font-bold text-gray-500 uppercase">Wait For</span>
                <span className="block text-sm font-bold text-gray-900">
                    {data.delay_days ? `${data.delay_days} Days` : '0 Days'}
                </span>
            </div>

            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-slate-400 border-2 border-white"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-slate-400 border-2 border-white"
            />
        </div>
    );
}
