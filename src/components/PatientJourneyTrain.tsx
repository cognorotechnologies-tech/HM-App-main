import { useState } from 'react';
import { Calendar, Pill, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface JourneyStop {
    id: string;
    type: 'appointment' | 'prescription';
    date: string;
    title: string;
    doctor?: string;
    diagnosis?: string;
    medicines?: string[];
    status?: string;
    notes?: string;
}

interface PatientJourneyTrainProps {
    patientId: string;
    journeyStops: JourneyStop[];
    loading?: boolean;
}

export default function PatientJourneyTrain({ journeyStops, loading }: PatientJourneyTrainProps) {
    const [selectedStop, setSelectedStop] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
                <div className="animate-pulse">
                    <div className="h-6 bg-blue-200 rounded w-1/4 mb-4"></div>
                    <div className="h-24 bg-blue-100 rounded"></div>
                </div>
            </div>
        );
    }

    // Empty state for new patients
    if (journeyStops.length === 0) {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🚂</span>
                    <h3 className="text-lg font-bold text-green-900">Patient Journey</h3>
                </div>
                <p className="text-green-700 text-sm">
                    🎉 Start of patient journey! This will be their first prescription.
                </p>
            </div>
        );
    }

    const getStopColor = (stop: JourneyStop) => {
        if (stop.type === 'appointment') {
            return stop.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500';
        }
        return stop.status === 'draft' ? 'bg-yellow-500' : 'bg-green-500';
    };

    const getStopIcon = (stop: JourneyStop) => {
        if (stop.type === 'appointment') return <Calendar size={16} className="text-white" />;
        return <Pill size={16} className="text-white" />;
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-200 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-3xl animate-bounce">🚂</span>
                    <h3 className="text-lg font-bold text-blue-900">Patient Journey Timeline</h3>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-semibold">
                        {journeyStops.length} stops
                    </span>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded transition-colors"
                >
                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
            </div>

            {/* Timeline */}
            {!isCollapsed && (
                <div className="relative overflow-x-auto pb-4">
                    <div className="min-w-max px-4">
                        {/* Train Track */}
                        <div className="relative flex items-center gap-8 py-8">
                            {/* Dashed track line */}
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-gray-400 -translate-y-1/2"></div>

                            {journeyStops.map((stop, index) => (
                                <div key={stop.id} className="relative flex flex-col items-center group">
                                    {/* Station Stop */}
                                    <div
                                        className={`${getStopColor(stop)} w-12 h-12 rounded-full flex items-center justify-center 
                                                   shadow-lg cursor-pointer transform transition-all duration-300 
                                                   hover:scale-125 hover:shadow-2xl z-10 relative
                                                   ${selectedStop === stop.id ? 'scale-125 ring-4 ring-blue-300' : ''}`}
                                        onClick={() => setSelectedStop(selectedStop === stop.id ? null : stop.id)}
                                    >
                                        {getStopIcon(stop)}

                                        {/* Pulse animation for selected */}
                                        {selectedStop === stop.id && (
                                            <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75"></span>
                                        )}
                                    </div>

                                    {/* Date label */}
                                    <div className="mt-3 text-center">
                                        <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            {format(new Date(stop.date), 'MMM d')}
                                        </p>
                                        <p className="text-xs text-gray-500 whitespace-nowrap">
                                            {format(new Date(stop.date), 'yyyy')}
                                        </p>
                                    </div>

                                    {/* Hover Tooltip */}
                                    <div className="absolute top-16 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                                            <p className="font-semibold">{stop.title}</p>
                                            <p className="text-gray-300">{stop.type === 'appointment' ? '🏥 Appointment' : '💊 Prescription'}</p>
                                        </div>
                                        <div className="w-2 h-2 bg-gray-900 transform rotate-45 -mt-1 mx-auto"></div>
                                    </div>

                                    {/* Connection line to next stop */}
                                    {index < journeyStops.length - 1 && (
                                        <div className="absolute top-1/2 left-full w-8 h-0.5 bg-transparent"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Detailed Card for Selected Stop */}
                        {selectedStop && (
                            <div className="mt-6 bg-white rounded-lg shadow-xl p-5 border-2 border-blue-300 animate-slide-in">
                                {(() => {
                                    const stop = journeyStops.find(s => s.id === selectedStop);
                                    if (!stop) return null;

                                    return (
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                        {stop.type === 'appointment' ? (
                                                            <Calendar size={20} className="text-blue-500" />
                                                        ) : (
                                                            <Pill size={20} className="text-green-500" />
                                                        )}
                                                        {stop.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        📅 {format(new Date(stop.date), 'MMMM d, yyyy')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedStop(null)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="space-y-3 text-sm">
                                                {stop.doctor && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-500 font-medium min-w-[80px]">Doctor:</span>
                                                        <span className="text-gray-900">{stop.doctor}</span>
                                                    </div>
                                                )}

                                                {stop.diagnosis && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-500 font-medium min-w-[80px]">Diagnosis:</span>
                                                        <span className="text-gray-900">{stop.diagnosis}</span>
                                                    </div>
                                                )}

                                                {stop.medicines && stop.medicines.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-500 font-medium min-w-[80px]">Medicines:</span>
                                                        <ul className="list-disc list-inside space-y-1 text-gray-900">
                                                            {stop.medicines.map((med, idx) => (
                                                                <li key={idx}>{med}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {stop.notes && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-500 font-medium min-w-[80px]">Notes:</span>
                                                        <span className="text-gray-900">{stop.notes}</span>
                                                    </div>
                                                )}

                                                {stop.status && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-gray-500 font-medium min-w-[80px]">Status:</span>
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase
                                                            ${stop.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                stop.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                    stop.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'}`}>
                                                            {stop.status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Legend */}
            {!isCollapsed && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-200 text-xs">
                    <span className="text-gray-600 font-medium">Legend:</span>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600">Appointment</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Prescription</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-gray-600">Draft</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-600">Cancelled</span>
                    </div>
                </div>
            )}
        </div>
    );
}
