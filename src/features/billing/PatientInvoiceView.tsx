import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { billingService } from '../../services/billingService';
import { format } from 'date-fns';
import { Printer, MapPin, Phone, Mail, ArrowLeft, CreditCard, Download } from 'lucide-react';
import { Button } from '../../components/Button';

// Component for viewing invoice details
export default function PatientInvoiceView() {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (invoiceId) {
            loadInvoice();
        }
    }, [invoiceId]);

    const loadInvoice = async () => {
        if (!invoiceId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await billingService.getInvoice(invoiceId);
            setInvoice(data);
        } catch (err: any) {
            console.error('Error loading invoice:', err);
            setError(err.message || 'Failed to load invoice');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center">
            <div className="text-red-600 text-xl font-bold mb-2">Error Loading Invoice</div>
            <div className="text-gray-600">{error}</div>
            <Link to="/dashboard/patient/billing" className="text-blue-600 hover:underline mt-4 block">
                Back to Billing History
            </Link>
        </div>
    );

    if (!invoice) return <div className="p-8 text-center text-red-600">Invoice not found.</div>;

    const balance = Number(invoice.total_amount) - Number(invoice.paid_amount);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 print:bg-white print:py-0">
            {/* Action Bar */}
            <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center print:hidden px-4">
                <Link to="/dashboard/patient/billing" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <ArrowLeft size={20} /> Back to Billing
                </Link>
                <div className="flex gap-4">
                    {invoice.payment_status !== 'paid' && invoice.payment_status !== 'cancelled' && (
                        <Link to={`/dashboard/patient/payment/${invoice.id}`}>
                            <Button className="flex items-center gap-2 bg-green-600 text-white shadow-lg hover:bg-green-700">
                                <CreditCard size={18} /> Pay Now
                            </Button>
                        </Link>
                    )}
                    <Button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700">
                        <Printer size={18} /> Print Invoice
                    </Button>
                </div>
            </div>

            {/* A4 Page Container */}
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none p-12 relative flex flex-col justify-between" id="print-area">

                {/* Header */}
                <header className="border-b-4 border-blue-900 pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">MEDI<span className="text-blue-500">CARE</span></h1>
                        <p className="text-sm text-gray-500 font-medium tracking-widest uppercase mt-1">Excellence in Healthcare</p>
                    </div>
                    <div className="text-right text-sm text-gray-600 space-y-1">
                        <p className="flex items-center justify-end gap-2"><MapPin size={14} /> 123 Health Ave, Medical City</p>
                        <p className="flex items-center justify-end gap-2"><Phone size={14} /> +1 (555) 123-4567</p>
                        <p className="flex items-center justify-end gap-2"><Mail size={14} /> billing@medicare.com</p>
                    </div>
                </header>

                {/* Invoice Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-10">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Billed To</p>
                        <h2 className="text-xl font-bold text-gray-800">{invoice.patient?.profiles?.first_name} {invoice.patient?.profiles?.last_name}</h2>
                        <div className="text-sm text-gray-600 mt-1">
                            {invoice.patient?.profiles?.email && <p>{invoice.patient.profiles.email}</p>}
                            {invoice.patient?.profiles?.phone && <p>{invoice.patient.profiles.phone}</p>}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Invoice Details</p>
                        <h2 className="text-lg font-bold text-gray-800">#{invoice.invoice_number}</h2>
                        <p className="text-sm text-gray-600">Issued: {format(new Date(invoice.issue_date), 'MMM d, yyyy')}</p>
                        {invoice.due_date && <p className="text-sm text-gray-600">Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}</p>}

                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mt-2 ${invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.payment_status === 'overdue' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {invoice.payment_status}
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="mb-8">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-200 text-left">
                                <th className="py-3 font-bold text-gray-700 w-1/2">Description</th>
                                <th className="py-3 font-bold text-gray-700 text-right">Qty</th>
                                <th className="py-3 font-bold text-gray-700 text-right">Price</th>
                                <th className="py-3 font-bold text-gray-700 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(invoice.items || []).map((item: any) => (
                                <tr key={item.id}>
                                    <td className="py-3">
                                        <div className="font-semibold text-gray-900">{item.description}</div>
                                        <div className="text-xs text-gray-500 capitalize">{item.service_type}</div>
                                    </td>
                                    <td className="py-3 text-right">{item.quantity}</td>
                                    <td className="py-3 text-right">₹{Number(item.unit_price).toFixed(2)}</td>
                                    <td className="py-3 text-right font-medium">₹{Number(item.total_price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal:</span>
                            <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
                        </div>
                        {Number(invoice.tax_amount) > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax:</span>
                                <span>₹{Number(invoice.tax_amount).toFixed(2)}</span>
                            </div>
                        )}
                        {Number(invoice.discount_amount) > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount:</span>
                                <span>-₹{Number(invoice.discount_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                            <span>Total:</span>
                            <span>₹{Number(invoice.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-green-600">
                            <span>Paid:</span>
                            <span>₹{Number(invoice.paid_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-blue-600 border-t-2 border-blue-100 pt-2">
                            <span>Balance Due:</span>
                            <span>₹{balance.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Terms & Notes */}
                {(invoice.notes || invoice.terms) && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                        {invoice.notes && (
                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Notes</h4>
                                <p className="text-sm text-gray-700">{invoice.notes}</p>
                            </div>
                        )}
                        {invoice.terms && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Terms & Conditions</h4>
                                <p className="text-sm text-gray-700">{invoice.terms}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
                    <p>Computer generated invoice • No signature required</p>
                    <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
                </div>
            </div>

            <style type="text/css" media="print">
                {`
                    @page { size: auto; margin: 0mm; }
                    body { background-color: white; }
                `}
            </style>
        </div>
    );
}
