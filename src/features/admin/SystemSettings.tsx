import { useState } from 'react';
import { Button } from '../../components/Button';

type Tab = 'hospital' | 'letterhead' | 'email' | 'sms' | 'payment' | 'preferences';

export default function SystemSettings() {
    const [activeTab, setActiveTab] = useState<Tab>('hospital');
    const [saving, setSaving] = useState(false);

    const tabs = [
        { id: 'hospital', label: 'Hospital Info', icon: '🏥' },
        { id: 'letterhead', label: 'Letterhead', icon: '📄' },
        { id: 'email', label: 'Email Templates', icon: '📧' },
        { id: 'sms', label: 'SMS Templates', icon: '📱' },
        { id: 'payment', label: 'Payment', icon: '💳' },
        { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    ];

    const handleSave = async () => {
        setSaving(true);
        // TODO: Implement save logic
        setTimeout(() => setSaving(false), 1000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600 mt-2">Configure hospital information, templates, and preferences</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`
                                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                    }
                                `}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {activeTab === 'hospital' && <HospitalInfoTab />}
                    {activeTab === 'letterhead' && <LetterheadTab />}
                    {activeTab === 'email' && <EmailTemplatesTab />}
                    {activeTab === 'sms' && <SmsTemplatesTab />}
                    {activeTab === 'payment' && <PaymentTab />}
                    {activeTab === 'preferences' && <PreferencesTab />}
                </div>

                {/* Save Button */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <Button variant="secondary">Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Hospital Info Tab
function HospitalInfoTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hospital Name *
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Medicare Hospital"
                            defaultValue="Medicare Hospital"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tagline
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Your Health, Our Priority"
                            defaultValue="Your Health, Our Priority"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="123 Medical Street, Healthcare City"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="info@hospital.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                        </label>
                        <input
                            type="url"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://hospital.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Registration Number
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="REG-12345"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Operating Hours</h4>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weekdays (Mon-Fri)
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="9:00 AM - 6:00 PM"
                            defaultValue="9:00 AM - 6:00 PM"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weekends (Sat-Sun)
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="10:00 AM - 4:00 PM"
                            defaultValue="10:00 AM - 4:00 PM"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Logo</h4>
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <span className="text-4xl">🏥</span>
                    </div>
                    <div>
                        <Button variant="secondary">Upload Logo</Button>
                        <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Letterhead Tab
function LetterheadTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Letterhead Design</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Customize the letterhead for prescriptions, reports, and official documents
                </p>

                <div className="bg-white border-2 border-gray-300 rounded-lg p-8 mb-6">
                    {/* Letterhead Preview */}
                    <div className="border-b-2 border-blue-600 pb-4 mb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                                    <span className="text-3xl">🏥</span>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">Medicare Hospital</h4>
                                <p className="text-sm text-gray-600">Your Health, Our Priority</p>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                                <p>123 Medical Street</p>
                                <p>Healthcare City, ST 12345</p>
                                <p>Phone: +1 234 567 8900</p>
                                <p>Email: info@hospital.com</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 text-gray-400 text-sm">
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                    </div>
                    <div className="border-t-2 border-gray-300 mt-6 pt-4 text-center text-xs text-gray-500">
                        <p>Accredited by Medical Council | Reg No: REG-12345</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Header Color
                        </label>
                        <input
                            type="color"
                            className="w-full h-10 rounded-lg cursor-pointer"
                            defaultValue="#2563eb"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Footer Text
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Accreditation info"
                            defaultValue="Accredited by Medical Council | Reg No: REG-12345"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Email Templates Tab
function EmailTemplatesTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Templates</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Customize email templates for automated communications
                </p>

                <div className="space-y-4">
                    {['Appointment Confirmation', 'Prescription Ready', 'Payment Receipt'].map((template) => (
                        <div key={template} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">{template}</h4>
                                <Button variant="secondary" size="sm">Edit</Button>
                            </div>
                            <p className="text-sm text-gray-600">
                                Subject: Your {template.toLowerCase()} from Medicare Hospital
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// SMS Templates Tab
function SmsTemplatesTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Templates</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Customize SMS templates for appointment reminders and notifications
                </p>

                <div className="space-y-4">
                    {['Appointment Reminder', 'Token Number', 'OTP Verification'].map((template) => (
                        <div key={template} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">{template}</h4>
                                <Button variant="secondary" size="sm">Edit</Button>
                            </div>
                            <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                                Hi {'{patient_name}'}, your {template.toLowerCase()} is {'{value}'}. - Medicare Hospital
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Payment Tab
function PaymentTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Configure payment methods and gateway settings
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Gateway
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>Razorpay</option>
                            <option>Stripe</option>
                            <option>PayPal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>INR (₹)</option>
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Accepted Payment Methods</h4>
                    <div className="space-y-3">
                        {['Cash', 'Credit/Debit Card', 'UPI', 'Net Banking', 'Insurance'].map((method) => (
                            <label key={method} className="flex items-center gap-3">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                                <span className="text-sm text-gray-700">{method}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Preferences Tab
function PreferencesTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Preferences</h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Zone
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>Asia/Kolkata (IST)</option>
                            <option>America/New_York (EST)</option>
                            <option>Europe/London (GMT)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date Format
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>DD/MM/YYYY</option>
                            <option>MM/DD/YYYY</option>
                            <option>YYYY-MM-DD</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Spanish</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appointment Duration (minutes)
                        </label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            defaultValue="30"
                            min="15"
                            step="15"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
