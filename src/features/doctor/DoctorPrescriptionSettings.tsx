// @ts-nocheck
// Doctor Prescription Settings Page
import React, { useState, useEffect } from 'react';
import { Save, Upload, Eye, Settings, FileText, Image, QrCode } from 'lucide-react';
import api from '../../lib/axios';
import { useToast } from '../../hooks/useToast';

interface Template {
    id: number;
    name: string;
    description: string;
    primary_color: string;
}

export const DoctorPrescriptionSettings = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Templates
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

    // Preferences
    const [preferences, setPreferences] = useState({
        signature_text: '',
        signature_image_url: '',
        qr_code_enabled: true,
        clinic_name: '',
        clinic_address: '',
        clinic_phone: '',
        clinic_email: '',
        clinic_website: '',
        registration_number: '',
        paper_size: 'A4'
    });

    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch templates
            const templatesRes = await api.get('/prescription-customization/templates');
            setTemplates(templatesRes.data);

            // Fetch current preferences
            try {
                const prefsRes = await api.get('/prescription-customization/preferences');
                if (prefsRes.data && prefsRes.data.id) {
                    setPreferences({
                        signature_text: prefsRes.data.signature_text || '',
                        signature_image_url: prefsRes.data.signature_image_url || '',
                        qr_code_enabled: prefsRes.data.qr_code_enabled ?? true,
                        clinic_name: prefsRes.data.clinic_name || '',
                        clinic_address: prefsRes.data.clinic_address || '',
                        clinic_phone: prefsRes.data.clinic_phone || '',
                        clinic_email: prefsRes.data.clinic_email || '',
                        clinic_website: prefsRes.data.clinic_website || '',
                        registration_number: prefsRes.data.registration_number || '',
                        paper_size: prefsRes.data.paper_size || 'A4'
                    });
                    setSelectedTemplateId(prefsRes.data.layout_template_id);
                    if (prefsRes.data.signature_image_url) {
                        setSignaturePreview(prefsRes.data.signature_image_url);
                    }
                }
            } catch (error) {
                // No preferences yet, use defaults
                console.log('No existing preferences, using defaults');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSignatureFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignaturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Upload signature if new file selected
            if (signatureFile) {
                const formData = new FormData();
                formData.append('signature', signatureFile);
                formData.append('signature_text', preferences.signature_text);

                const signatureRes = await api.post('/prescription-customization/signature', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                preferences.signature_image_url = signatureRes.data.signature_url;
            }

            // Save preferences
            await api.put('/prescription-customization/preferences', {
                layout_template_id: selectedTemplateId,
                ...preferences
            });

            toast.success('Prescription settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Settings className="text-indigo-600" size={36} />
                        Prescription Settings
                    </h1>
                    <p className="text-gray-600">Customize how your prescriptions look and what information they contain</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Template Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Template Selection */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={24} className="text-indigo-600" />
                                Choose Template
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                {templates.map(template => (
                                    <div
                                        key={template.id}
                                        onClick={() => setSelectedTemplateId(template.id)}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedTemplateId === template.id
                                                ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="aspect-[3/4] bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-200">
                                            <FileText size={32} style={{ color: template.primary_color }} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-center">{template.name}</h3>
                                        <p className="text-xs text-gray-600 text-center mt-1">{template.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Clinic Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Clinic Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
                                    <input
                                        type="text"
                                        value={preferences.clinic_name}
                                        onChange={(e) => setPreferences({ ...preferences, clinic_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Your Clinic Name"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <textarea
                                        value={preferences.clinic_address}
                                        onChange={(e) => setPreferences({ ...preferences, clinic_address: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        rows={2}
                                        placeholder="Clinic Address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={preferences.clinic_phone}
                                        onChange={(e) => setPreferences({ ...preferences, clinic_phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="+91 XXXXXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={preferences.clinic_email}
                                        onChange={(e) => setPreferences({ ...preferences, clinic_email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="clinic@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                    <input
                                        type="url"
                                        value={preferences.clinic_website}
                                        onChange={(e) => setPreferences({ ...preferences, clinic_website: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="www.yourclinic.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                                    <input
                                        type="text"
                                        value={preferences.registration_number}
                                        onChange={(e) => setPreferences({ ...preferences, registration_number: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Medical Reg. No."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Signature & Options */}
                    <div className="space-y-6">
                        {/* Signature Upload */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Image size={24} className="text-indigo-600" />
                                Signature
                            </h2>

                            {signaturePreview && (
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <img src={signaturePreview} alt="Signature" className="max-h-24 mx-auto" />
                                </div>
                            )}

                            <label className="block">
                                <span className="sr-only">Choose signature image</span>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-indigo-300 border-dashed rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload size={32} className="text-indigo-600 mb-2" />
                                            <p className="text-sm text-gray-600 text-center px-4">
                                                <span className="font-semibold">Click to upload</span> signature
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleSignatureChange}
                                        />
                                    </label>
                                </div>
                            </label>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Signature Text</label>
                                <input
                                    type="text"
                                    value={preferences.signature_text}
                                    onChange={(e) => setPreferences({ ...preferences, signature_text: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Dr. John Doe, MBBS, MD"
                                />
                            </div>
                        </div>

                        {/* Additional Options */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Options</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <QrCode size={20} className="text-indigo-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">QR Code</p>
                                            <p className="text-xs text-gray-600">Add verification QR</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferences.qr_code_enabled}
                                            onChange={(e) => setPreferences({ ...preferences, qr_code_enabled: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Paper Size</label>
                                    <select
                                        value={preferences.paper_size}
                                        onChange={(e) => setPreferences({ ...preferences, paper_size: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="A4">A4</option>
                                        <option value="Letter">Letter</option>
                                        <option value="A5">A5</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${saving
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:-translate-y-0.5'
                                }`}
                        >
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorPrescriptionSettings;
