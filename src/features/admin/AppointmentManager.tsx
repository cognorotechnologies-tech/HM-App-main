import { useEffect, useState } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { format } from 'date-fns';

export default function AppointmentManager() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const data = await appointmentService.getAll();
            setAppointments(data || []);
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            await appointmentService.updateStatus(id, status);
            loadAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">All Appointments</h1>
                <p className="text-gray-500">Monitor and manage all hospital appointments</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-600"></div>
                        <p className="mt-4 text-gray-500 text-sm">Loading appointments...</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No appointments scheduled</p>
                        <p className="text-gray-400 text-sm mt-1">Appointments will appear here when patients book</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                            Date & Time
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                            </svg>
                                            Patient
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            Doctor
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Reason
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Status
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-orange-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {appointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-orange-50/50 transition-all duration-200 group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-orange-100 group-hover:ring-orange-200 transition-all">
                                                    {new Date(apt.appointment_date).getDate()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{format(new Date(apt.appointment_date), 'MMM d, yyyy')}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {apt.start_time.slice(0, 5)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-medium text-gray-900">{apt.patients?.profiles?.first_name} {apt.patients?.profiles?.last_name}</div>
                                            <div className="text-xs text-gray-500">{apt.patients?.profiles?.email}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm text-gray-700">
                                                Dr. {apt.doctors?.profiles?.first_name} {apt.doctors?.profiles?.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm text-gray-600 truncate max-w-xs" title={apt.reason}>
                                                {apt.reason || <span className="italic text-gray-400">No reason provided</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2 ${apt.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                apt.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    apt.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {apt.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(apt.id, 'confirmed')}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-all text-xs border border-green-200"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(apt.id, 'cancelled')}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition-all text-xs border border-red-200"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                                {apt.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => updateStatus(apt.id, 'completed')}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-all text-xs border border-blue-200"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
