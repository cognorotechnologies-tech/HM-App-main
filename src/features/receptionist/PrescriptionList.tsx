import { useEffect, useState } from 'react';
import { prescriptionService } from '../../services/prescriptionService';
import { Button } from '../../components/Button';
import { Link } from 'react-router-dom';
import { Search, Printer } from 'lucide-react';
import { format } from 'date-fns';

export default function PrescriptionList() {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            // We need a method to get prescriptions by status or filter client side
            const data = await prescriptionService.getAll();
            // Filter for final status if needed (backend getAll returns all?)
            // Assuming we display all for now or filter locally
            const finalPrescriptions = data.filter((p: any) => true); // Adjust if status field exists
            setPrescriptions(finalPrescriptions);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        }
        setLoading(false);
    };

    const filteredPrescriptions = prescriptions.filter(p => {
        const patientName = `${p.patient_first_name} ${p.patient_last_name}`.toLowerCase();
        return patientName.includes(searchTerm.toLowerCase());
    });

    if (loading) return <div className="p-8 text-center">Loading prescriptions...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search patient..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow Up</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPrescriptions.map((pres) => (
                            <tr key={pres.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {pres.patient_first_name} {pres.patient_last_name}
                                    </div>
                                    <div className="text-xs text-gray-500">{pres.patient_phone || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">Dr. {pres.doctor_last_name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {format(new Date(pres.created_at), 'MMM d, yyyy')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {pres.follow_up_date ? (
                                        <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                                            {format(new Date(pres.follow_up_date), 'MMM d')}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/dashboard/receptionist/prescriptions/${pres.id}/print`} target="_blank">
                                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                            <Printer size={16} /> Print
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredPrescriptions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No final prescriptions found.
                    </div>
                )}
            </div>
        </div>
    );
}
