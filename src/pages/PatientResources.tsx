import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { useState } from 'react';

export default function PatientResources() {
    const forms = [
        { name: "New Patient Registration Form", size: "250 KB", type: "PDF" },
        { name: "Medical History Questionnaire", size: "120 KB", type: "PDF" },
        { name: "Insurance Claim Form", size: "450 KB", type: "DOCX" },
        { name: "Consent for Surgery", size: "180 KB", type: "PDF" },
    ];

    const faqs = [
        { q: "What should I bring for my first visit?", a: "Please bring a valid ID, your insurance card, and any previous medical records or prescriptions." },
        { q: "Do you accept walk-in patients?", a: "Yes, we accept walk-ins for emergencies and general OPD. However, we recommend booking an appointment for specialists." },
        { q: "How can I access my lab reports?", a: "You can view and download all your lab reports directly from the Patient Portal after logging in." },
        { q: "What are your visiting hours?", a: "General ward visiting hours are 10:00 AM - 12:00 PM and 4:00 PM - 7:00 PM. ICU visiting hours are restricted." },
    ];

    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <header className="bg-gradient-to-r from-teal-800 to-teal-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Patient Resources</h1>
                    <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                        Everything you need to make your hospital visit smooth and hassle-free.
                    </p>
                </div>
            </header>

            {/* Quick Actions Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-teal-50 hover:shadow-xl transition-all text-center group">
                        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                            📅
                        </div>
                        <h3 className="text-xl font-bold mb-3">Appointments</h3>
                        <p className="text-gray-500 mb-6">Schedule, reschedule, or cancel your appointments online.</p>
                        <Link to="/login"><Button className="w-full bg-teal-600 hover:bg-teal-700">Book Now</Button></Link>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-teal-50 hover:shadow-xl transition-all text-center group">
                        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                            🧪
                        </div>
                        <h3 className="text-xl font-bold mb-3">Lab Reports</h3>
                        <p className="text-gray-500 mb-6">Check your test results and download digital reports.</p>
                        <Link to="/login"><Button variant="outline" className="w-full border-teal-600 text-teal-600 hover:bg-teal-50">View Reports</Button></Link>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-teal-50 hover:shadow-xl transition-all text-center group">
                        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                            💳
                        </div>
                        <h3 className="text-xl font-bold mb-3">Pay Bills</h3>
                        <p className="text-gray-500 mb-6">Securely pay your medical bills online using credit or debit cards.</p>
                        <Link to="/login"><Button variant="outline" className="w-full border-teal-600 text-teal-600 hover:bg-teal-50">Pay Now</Button></Link>
                    </div>
                </div>

                {/* Downloads Section */}
                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Downloadable Forms</h2>
                        <p className="text-gray-600 mb-8">Save time at the reception by filling out these forms before your visit.</p>
                        <div className="space-y-4">
                            {forms.map((form, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl text-red-500">📄</div>
                                        <div>
                                            <div className="font-semibold text-gray-800">{form.name}</div>
                                            <div className="text-xs text-gray-500">{form.type} • {form.size}</div>
                                        </div>
                                    </div>
                                    <div className="text-teal-600 font-medium text-sm">Download ↓</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="bg-teal-50 p-8 rounded-2xl">
                            <h3 className="text-2xl font-bold text-teal-900 mb-4">Insurance Partners</h3>
                            <p className="text-teal-700 mb-6">We accept cashless claims from all major insurance providers.</p>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Placeholders for insurance logos */}
                                <div className="bg-white h-16 rounded flex items-center justify-center text-gray-400 font-bold border">AETNA</div>
                                <div className="bg-white h-16 rounded flex items-center justify-center text-gray-400 font-bold border">CIGNA</div>
                                <div className="bg-white h-16 rounded flex items-center justify-center text-gray-400 font-bold border">BLUE CROSS</div>
                                <div className="bg-white h-16 rounded flex items-center justify-center text-gray-400 font-bold border">UNITED</div>
                                <div className="bg-white h-16 rounded flex items-center justify-center text-gray-400 font-bold border">METLIFE</div>
                                <div className="bg-white h-16 rounded flex items-center justify-center text-gray-400 font-bold border">+ 20 More</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border rounded-xl overflow-hidden">
                                <button
                                    className="w-full text-left p-6 bg-white hover:bg-gray-50 flex justify-between items-center transition-colors"
                                    onClick={() => toggleFaq(idx)}
                                >
                                    <span className="font-semibold text-lg text-gray-800">{faq.q}</span>
                                    <span className={`transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                {openFaq === idx && (
                                    <div className="p-6 bg-gray-50 border-t text-gray-600 leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
