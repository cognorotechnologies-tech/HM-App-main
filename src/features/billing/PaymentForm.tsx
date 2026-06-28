import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';
import { billingService } from '../../services/billingService';
import { paymentService } from '../../services/paymentService';
import { CreditCard, Building2, Smartphone, Wallet, ArrowLeft, CheckCircle } from 'lucide-react';

export default function PaymentForm() {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const toast = useToast();

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'razorpay'>('razorpay');
    const [amount, setAmount] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (invoiceId) {
            loadInvoice();
        }
    }, [invoiceId]);

    const loadInvoice = async () => {
        if (!invoiceId) return;

        try {
            setLoading(true);
            const data = await billingService.getInvoice(invoiceId);
            setInvoice(data);
            // Set default amount to remaining balance
            const balance = Number(data.total_amount) - Number(data.paid_amount);
            setAmount(balance.toFixed(2));
        } catch (error: any) {
            console.error('Error loading invoice:', error);
            toast.error('Failed to load invoice details');
            navigate('/dashboard/patient/billing');
        } finally {
            setLoading(false);
        }
    };

    const handleRazorpayPayment = async () => {
        if (!user || !invoice || !amount) return;

        try {
            setProcessing(true);

            // Initialize payment transaction  
            const { transaction_id, payment_id } = await paymentService.initializeOnlinePayment(
                invoice.id,
                parseFloat(amount),
                'razorpay'
            );

            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy', // Replace with actual key
                    amount: parseFloat(amount) * 100, // Razorpay expects paise
                    currency: 'INR',
                    name: 'Hospital Management System',
                    description: `Payment for Invoice ${invoice.invoice_number}`,
                    order_id: transaction_id,
                    handler: async function (response: any) {
                        // Payment successful
                        try {
                            await paymentService.updatePaymentStatus(payment_id, 'success', response);
                            setShowSuccess(true);
                            setTimeout(() => {
                                navigate('/dashboard/patient/billing');
                            }, 3000);
                        } catch (error) {
                            toast.error('Payment verification failed');
                        }
                    },
                    prefill: {
                        name: `${invoice.patient?.profiles?.first_name} ${invoice.patient?.profiles?.last_name}`,
                        email: invoice.patient?.profiles?.email,
                        contact: invoice.patient?.profiles?.phone,
                    },
                    theme: {
                        color: '#2563eb',
                    },
                    modal: {
                        ondismiss: async function () {
                            // Payment cancelled
                            await paymentService.updatePaymentStatus(payment_id, 'cancelled', {
                                reason: 'User closed payment window',
                            });
                            setProcessing(false);
                        },
                    },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            };
        } catch (error: any) {
            console.error('Error processing payment:', error);
            toast.error(error.message || 'Payment failed');
            setProcessing(false);
        }
    };

    const handleStripePayment = async () => {
        toast.info('Stripe integration coming soon!');
        // Similar implementation for Stripe
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const balance = Number(invoice.total_amount) - Number(invoice.paid_amount);
        if (parseFloat(amount) > balance) {
            toast.error('Amount cannot exceed outstanding balance');
            return;
        }

        if (paymentMethod === 'razorpay') {
            await handleRazorpayPayment();
        } else {
            await handleStripePayment();
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 mt-2">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
                    <p className="text-gray-600 mb-2">Your payment has been processed successfully</p>
                    <p className="text-sm text-gray-500">Redirecting to billing history...</p>
                </div>
            </div>
        );
    }

    if (!invoice) return null;

    const balance = Number(invoice.total_amount) - Number(invoice.paid_amount);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <button
                onClick={() => navigate('/dashboard/patient/billing')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Billing
            </button>

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Make Payment</h1>
                </div>
                <p className="text-gray-600">Complete your payment for invoice {invoice.invoice_number}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Invoice Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="font-bold text-lg mb-4">Invoice Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Invoice Number:</span>
                                <span className="font-semibold">{invoice.invoice_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-semibold">₹{Number(invoice.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Paid Amount:</span>
                                <span className="font-semibold text-green-600">₹{Number(invoice.paid_amount).toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between">
                                <span className="text-gray-900 font-bold">Outstanding:</span>
                                <span className="font-bold text-orange-600">₹{balance.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="font-bold text-lg mb-6">Payment Details</h3>

                        {/* Amount */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    step="0.01"
                                    min="0.01"
                                    max={balance}
                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Maximum: ₹{balance.toFixed(2)}
                            </p>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('razorpay')}
                                    className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'razorpay'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Wallet className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                    <p className="font-semibold text-sm">Razorpay</p>
                                    <p className="text-xs text-gray-500">UPI, Cards, Wallets</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('online')}
                                    className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'online'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                                    <p className="font-semibold text-sm">Stripe</p>
                                    <p className="text-xs text-gray-500">Credit/Debit Cards</p>
                                </button>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>Secure Payment:</strong> Your payment information is encrypted and secure.
                                You will be redirected to the payment gateway to complete the transaction.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing || !amount}
                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Processing...' : `Pay ₹${amount || '0.00'}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
