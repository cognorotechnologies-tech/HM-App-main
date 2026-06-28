import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function TestingDashboard() {
    const { user } = useAuthStore();
    const profile = (useAuthStore.getState() as any).profile || null;
    const [activeTab, setActiveTab] = useState('features');

    const features = {
        authentication: [
            { name: 'Multi-Portal Login', path: '/login', desc: 'Patient login portal', public: true },
            { name: 'Staff Portal Selection', path: '/staff', desc: 'Staff portal hub', public: true },
            { name: 'Doctor Login', path: '/staff/doctor', desc: 'Doctor-specific login', public: true },
            { name: 'Admin Login', path: '/staff/admin', desc: 'Admin portal login', public: true },
            { name: 'Receptionist Login', path: '/staff/receptionist', desc: 'Receptionist login', public: true },
            { name: 'Patient Registration', path: '/register', desc: 'New patient signup', public: true },
        ],
        patient: [
            { name: 'Patient Dashboard', path: '/dashboard/patient', desc: 'Patient home with 4 quick action cards', role: 'patient' },
            { name: 'Book Appointment', path: '/dashboard/patient/book', desc: 'Enhanced 4-step booking with animations', role: 'patient' },
            { name: 'Medical Documents', path: '/dashboard/patient/documents', desc: 'Upload, categorize & manage documents', role: 'patient' },
            { name: 'Health Tracking', path: '/dashboard/patient/health', desc: 'Track BP, sugar, weight with charts', role: 'patient' },
            { name: 'Family Management', path: '/dashboard/patient/family', desc: 'Manage family members & permissions', role: 'patient' },
            { name: 'Messages', path: '/dashboard/patient/messages', desc: 'Patient-doctor messaging system', role: 'patient' },
        ],
        doctor: [
            { name: 'Doctor Dashboard', path: '/dashboard/doctor', desc: 'Doctor home dashboard', role: 'doctor' },
            { name: 'Doctor Appointments', path: '/dashboard/doctor/appointments', desc: "View today's appointments", role: 'doctor' },
            { name: 'Schedule Manager', path: '/dashboard/doctor/schedule', desc: 'Set weekly availability', role: 'doctor' },
        ],
        admin: [
            { name: 'Admin Dashboard', path: '/dashboard/admin', desc: 'Analytics & overview', role: 'admin' },
            { name: 'Departments Manager', path: '/dashboard/admin/departments', desc: 'CRUD departments', role: 'admin' },
            { name: 'Doctors Manager', path: '/dashboard/admin/doctors', desc: 'Doctor onboarding', role: 'admin' },
            { name: 'Patients Manager', path: '/dashboard/admin/patients', desc: 'View all patients', role: 'admin' },
            { name: 'Appointments Manager', path: '/dashboard/admin/appointments', desc: 'Manage all appointments', role: 'admin' },
            { name: 'System Settings', path: '/dashboard/admin/settings', desc: 'Hospital configuration', role: 'admin' },
            { name: 'User Management', path: '/dashboard/admin/users', desc: 'Manage users & roles', role: 'admin' },
        ],
        receptionist: [
            { name: 'Receptionist Dashboard', path: '/dashboard/receptionist', desc: 'Receptionist home', role: 'receptionist' },
            { name: 'OPD Patient Registration', path: '/dashboard/receptionist/register', desc: 'Walk-in patient intake', role: 'receptionist' },
            { name: 'Patient Search', path: '/dashboard/receptionist/patients', desc: 'Search by name/phone/email', role: 'receptionist' },
            { name: 'Queue Management', path: '/dashboard/receptionist/queue', desc: 'Manage OPD queue', role: 'receptionist' },
            { name: 'Prescription List', path: '/dashboard/receptionist/prescriptions', desc: 'View prescriptions', role: 'receptionist' },
        ],
        public: [
            { name: 'Home Page', path: '/', desc: 'Hospital landing page', public: true },
            { name: 'About Hospital', path: '/about', desc: 'About us page', public: true },
            { name: 'Services', path: '/services', desc: 'Services offered', public: true },
            { name: 'Departments', path: '/departments', desc: 'Department listing', public: true },
            { name: 'Doctors Directory', path: '/doctors', desc: 'Browse all doctors', public: true },
            { name: 'Patient Resources', path: '/resources', desc: 'Patient resources', public: true },
            { name: 'Contact', path: '/contact', desc: 'Contact information', public: true },
        ],
    };

    const testAccounts = [
        { role: 'Admin', email: 'admin@hospital.com', password: 'admin123', color: 'bg-purple-100 text-purple-800', icon: '⚙️' },
        { role: 'Doctor (Cardio)', email: 'dr.cardio@hospital.com', password: 'doctor123', color: 'bg-blue-100 text-blue-800', icon: '👨‍⚕️' },
        { role: 'Doctor (Neuro)', email: 'dr.neuro@hospital.com', password: 'doctor123', color: 'bg-blue-100 text-blue-800', icon: '🧠' },
        { role: 'Patient', email: 'patient@demo.com', password: 'patient123', color: 'bg-green-100 text-green-800', icon: '👤' },
        { role: 'Receptionist', email: 'admin@hospital.com', password: 'admin123', color: 'bg-teal-100 text-teal-800', icon: '🏥', note: 'Use admin account' },
    ];

    const testScenarios = [
        {
            id: 'patient-journey',
            title: '🎯 Complete Patient Journey',
            category: 'E2E',
            complexity: 'High',
            steps: [
                { step: 1, action: 'Register as new patient', endpoint: '/register', method: 'POST' },
                { step: 2, action: 'Login to patient portal', endpoint: '/login', method: 'POST' },
                { step: 3, action: 'Navigate to Book Appointment', endpoint: '/dashboard/patient/book', method: 'GET' },
                { step: 4, action: 'Select Department (Cardiology)', data: 'department_id' },
                { step: 5, action: 'Select Doctor', data: 'doctor_id' },
                { step: 6, action: 'Choose appointment date', data: 'date' },
                { step: 7, action: 'Select time slot', data: 'time_slot' },
                { step: 8, action: 'Enter reason for visit', data: 'reason' },
                { step: 9, action: 'Confirm booking', endpoint: '/appointments', method: 'POST' },
                { step: 10, action: 'Verify appointment in dashboard', endpoint: '/appointments', method: 'GET' },
            ],
            expectedResults: [
                '✅ User created in auth.users',
                '✅ Profile created with role=patient',
                '✅ Patient record created',
                '✅ Appointment booked with status=pending',
                '✅ Appointment visible in patient dashboard',
            ]
        },
        {
            id: 'opd-walkin',
            title: '🏥 OPD Walk-in Registration',
            category: 'Receptionist',
            complexity: 'Medium',
            steps: [
                { step: 1, action: 'Login as admin/receptionist', endpoint: '/staff/admin', method: 'POST' },
                { step: 2, action: 'Navigate to OPD Registration', endpoint: '/dashboard/receptionist/register', method: 'GET' },
                { step: 3, action: 'Fill patient details', data: 'patient_info' },
                { step: 4, action: 'Enter medical history', data: 'medical_data' },
                { step: 5, action: 'Add emergency contact', data: 'emergency_contact' },
                { step: 6, action: 'Select department', data: 'department_id' },
                { step: 7, action: 'Assign doctor', data: 'doctor_id' },
                { step: 8, action: 'Enter chief complaint', data: 'complaint' },
                { step: 9, action: 'Record vitals', data: 'vitals' },
                { step: 10, action: 'Submit and generate token', endpoint: '/patient_visits', method: 'POST' },
            ],
            expectedResults: [
                '✅ Patient visit created',
                '✅ Token number generated (e.g., CARD-001)',
                '✅ Queue position assigned',
                '✅ Vitals stored as JSONB',
            ]
        },
        {
            id: 'doctor-prescription',
            title: '💊 Doctor Consultation & Prescription',
            category: 'Doctor',
            complexity: 'High',
            steps: [
                { step: 1, action: 'Login as doctor', endpoint: '/staff/doctor', method: 'POST' },
                { step: 2, action: 'View today\'s appointments', endpoint: '/appointments', method: 'GET' },
                { step: 3, action: 'Select patient appointment', data: 'appointment_id' },
                { step: 4, action: 'Review patient history', endpoint: '/prescriptions', method: 'GET' },
                { step: 5, action: 'Navigate to Prescribe form', endpoint: '/dashboard/doctor/prescribe/:id', method: 'GET' },
                { step: 6, action: 'Enter diagnosis', data: 'diagnosis' },
                { step: 7, action: 'Add medicines (name, dosage, frequency)', data: 'medicines[]' },
                { step: 8, action: 'Add instructions', data: 'instructions' },
                { step: 9, action: 'Add investigations', data: 'investigations[]' },
                { step: 10, action: 'Set follow-up date', data: 'follow_up_date' },
                { step: 11, action: 'Save prescription', endpoint: '/prescriptions', method: 'POST' },
            ],
            expectedResults: [
                '✅ Prescription created with auto-generated number',
                '✅ Medicines stored as JSONB array',
                '✅ Appointment status updated to completed',
                '✅ Patient can view prescription',
            ]
        },
        {
            id: 'admin-onboarding',
            title: '👨‍⚕️ Admin Onboards New Doctor',
            category: 'Admin',
            complexity: 'Medium',
            steps: [
                { step: 1, action: 'Login as admin', endpoint: '/staff/admin', method: 'POST' },
                { step: 2, action: 'Navigate to Doctors Manager', endpoint: '/dashboard/admin/doctors', method: 'GET' },
                { step: 3, action: 'Click Add Doctor', data: null },
                { step: 4, action: 'Create new user OR promote existing', data: 'user_id' },
                { step: 5, action: 'Fill doctor details', data: 'doctor_info' },
                { step: 6, action: 'Set specialization', data: 'specialization' },
                { step: 7, action: 'Add qualifications', data: 'qualifications' },
                { step: 8, action: 'Enter license number', data: 'license_number' },
                { step: 9, action: 'Set years of experience', data: 'years_of_experience' },
                { step: 10, action: 'Assign department', data: 'department_id' },
                { step: 11, action: 'Save doctor profile', endpoint: '/doctors', method: 'POST' },
            ],
            expectedResults: [
                '✅ Profile role updated to doctor',
                '✅ Doctor record created',
                '✅ Doctor visible in directory',
                '✅ Patients can book appointments',
            ]
        },
        {
            id: 'schedule-management',
            title: '📅 Doctor Sets Weekly Schedule',
            category: 'Doctor',
            complexity: 'Medium',
            steps: [
                { step: 1, action: 'Login as doctor', endpoint: '/staff/doctor', method: 'POST' },
                { step: 2, action: 'Navigate to Schedule Manager', endpoint: '/dashboard/doctor/schedule', method: 'GET' },
                { step: 3, action: 'Set Monday hours (9 AM - 5 PM)', data: 'day_of_week=1' },
                { step: 4, action: 'Set Tuesday as OFF', data: 'is_available=false' },
                { step: 5, action: 'Set Wednesday hours (10 AM - 2 PM)', data: 'day_of_week=3' },
                { step: 6, action: 'Configure slot duration (30 min)', data: 'slot_duration=30' },
                { step: 7, action: 'Save schedule', endpoint: '/schedules', method: 'POST' },
            ],
            expectedResults: [
                '✅ Schedule saved for each day',
                '✅ Slots auto-generated based on hours',
                '✅ Patients can see available times',
                '✅ No slots on OFF days',
            ]
        },
        {
            id: 'department-crud',
            title: '🏢 Admin Manages Departments',
            category: 'Admin',
            complexity: 'Low',
            steps: [
                { step: 1, action: 'Login as admin', endpoint: '/staff/admin', method: 'POST' },
                { step: 2, action: 'Navigate to Departments Manager', endpoint: '/dashboard/admin/departments', method: 'GET' },
                { step: 3, action: 'Click Add Department', data: null },
                { step: 4, action: 'Enter department name', data: 'name' },
                { step: 5, action: 'Enter description', data: 'description' },
                { step: 6, action: 'Save department', endpoint: '/departments', method: 'POST' },
                { step: 7, action: 'Edit existing department', endpoint: '/departments/:id', method: 'PATCH' },
                { step: 8, action: 'Delete department', endpoint: '/departments/:id', method: 'DELETE' },
            ],
            expectedResults: [
                '✅ Department created',
                '✅ Visible in department list',
                '✅ Can assign doctors to department',
                '✅ Delete removes department',
            ]
        },
    ];

    const databaseSchema = {
        tables: [
            { name: 'profiles', records: '~20', description: 'Base user table (all roles)' },
            { name: 'patients', records: '~15', description: 'Extended patient info' },
            { name: 'doctors', records: '~5', description: 'Doctor-specific details' },
            { name: 'departments', records: '~8', description: 'Hospital departments' },
            { name: 'appointments', records: '~30', description: 'Appointment bookings' },
            { name: 'schedules', records: '~35', description: 'Doctor weekly schedules' },
            { name: 'prescriptions', records: '~25', description: 'Medical prescriptions' },
            { name: 'patient_visits', records: '~10', description: 'OPD walk-in visits' },
            { name: 'consultations', records: '~20', description: 'Detailed consultations' },
            { name: 'letterhead_template', records: '1', description: 'Hospital branding' },
        ]
    };

    const apiEndpoints = [
        { category: 'Auth', endpoints: ['POST /auth/signup', 'POST /auth/signin', 'POST /auth/signout'] },
        { category: 'Appointments', endpoints: ['GET /appointments', 'POST /appointments', 'PATCH /appointments/:id'] },
        { category: 'Doctors', endpoints: ['GET /doctors', 'POST /doctors', 'PATCH /doctors/:id', 'DELETE /doctors/:id'] },
        { category: 'Departments', endpoints: ['GET /departments', 'POST /departments', 'PATCH /departments/:id', 'DELETE /departments/:id'] },
        { category: 'Prescriptions', endpoints: ['GET /prescriptions', 'POST /prescriptions', 'GET /prescriptions/:id'] },
        { category: 'Schedules', endpoints: ['GET /schedules', 'POST /schedules', 'PATCH /schedules/:id'] },
    ];

    const FeatureCard = ({ feature }: { feature: any }) => {
        const canAccess = feature.public || (profile?.role === feature.role) || profile?.role === 'admin';

        return (
            <Link
                to={feature.path}
                className={`block p-4 rounded-lg border-2 transition-all hover:scale-102 ${canAccess
                    ? 'border-blue-300 hover:border-blue-500 hover:shadow-md bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                onClick={(e) => !canAccess && e.preventDefault()}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{feature.desc}</p>
                        {feature.role && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 uppercase">
                                {feature.role}
                            </span>
                        )}
                    </div>
                    {canAccess ? (
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    )}
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-gray-900 mb-3">
                        🧪 Hospital Management System
                    </h1>
                    <h2 className="text-2xl text-gray-700 mb-2">Comprehensive Testing Dashboard</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Test all functionalities, use cases, and workflows of the HMS platform
                    </p>
                    {user && (
                        <div className="mt-4 inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg">
                            Logged in as: <strong>{profile?.email}</strong> ({profile?.role})
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('features')}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === 'features'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-blue-500'
                            }`}
                    >
                        📋 Features
                    </button>
                    <button
                        onClick={() => setActiveTab('scenarios')}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === 'scenarios'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-blue-500'
                            }`}
                    >
                        🎯 Test Scenarios
                    </button>
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === 'database'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-blue-500'
                            }`}
                    >
                        🗄️ Database
                    </button>
                    <button
                        onClick={() => setActiveTab('api')}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === 'api'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-600 hover:text-blue-500'
                            }`}
                    >
                        🔌 API Endpoints
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'features' && (
                    <div className="space-y-8">
                        {/* Test Accounts */}
                        <div className="bg-white rounded-xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <svg className="w-7 h-7 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                🔑 Test Accounts
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {testAccounts.map((account, idx) => (
                                    <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-3 ${account.color}`}>
                                            <span>{account.icon}</span>
                                            {account.role}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center">
                                                <strong className="w-20">Email:</strong>
                                                <code className="bg-gray-100 px-2 py-1 rounded text-xs flex-1">{account.email}</code>
                                            </div>
                                            <div className="flex items-center">
                                                <strong className="w-20">Password:</strong>
                                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{account.password}</code>
                                            </div>
                                            {account.note && (
                                                <div className="text-xs text-amber-600 italic mt-2 bg-amber-50 p-2 rounded">
                                                    ⚠️ {account.note}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="space-y-8">
                            {/* Authentication */}
                            <section className="bg-white rounded-xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center mr-3 text-xl">🔐</span>
                                    Authentication & Login
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {features.authentication.map((feature, idx) => (
                                        <FeatureCard key={idx} feature={feature} />
                                    ))}
                                </div>
                            </section>

                            {/* Public Pages */}
                            <section className="bg-white rounded-xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-gray-500 text-white rounded-full flex items-center justify-center mr-3 text-xl">🌐</span>
                                    Public Website
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {features.public.map((feature, idx) => (
                                        <FeatureCard key={idx} feature={feature} />
                                    ))}
                                </div>
                            </section>

                            {/* Patient Features */}
                            <section className="bg-white rounded-xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-xl">👤</span>
                                    Patient Portal
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {features.patient.map((feature, idx) => (
                                        <FeatureCard key={idx} feature={feature} />
                                    ))}
                                </div>
                            </section>

                            {/* Doctor Features */}
                            <section className="bg-white rounded-xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-xl">👨‍⚕️</span>
                                    Doctor Portal
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {features.doctor.map((feature, idx) => (
                                        <FeatureCard key={idx} feature={feature} />
                                    ))}
                                </div>
                            </section>

                            {/* Admin Features */}
                            <section className="bg-white rounded-xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center mr-3 text-xl">⚙️</span>
                                    Admin Panel
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {features.admin.map((feature, idx) => (
                                        <FeatureCard key={idx} feature={feature} />
                                    ))}
                                </div>
                            </section>

                            {/* Receptionist Features */}
                            <section className="bg-white rounded-xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center mr-3 text-xl">🏥</span>
                                    Receptionist Module
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {features.receptionist.map((feature, idx) => (
                                        <FeatureCard key={idx} feature={feature} />
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'scenarios' && (
                    <div className="space-y-6">
                        {testScenarios.map((scenario) => (
                            <div key={scenario.id} className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-blue-500">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{scenario.title}</h3>
                                        <div className="flex gap-2 mt-2">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                {scenario.category}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${scenario.complexity === 'High' ? 'bg-red-100 text-red-800' :
                                                scenario.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {scenario.complexity} Complexity
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-700 text-lg">📝 Test Steps:</h4>
                                    <div className="space-y-1">
                                        {scenario.steps.map((step) => (
                                            <div key={step.step} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                                                <span className="flex-shrink-0 w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                    {step.step}
                                                </span>
                                                <div className="flex-1">
                                                    <span className="font-medium text-gray-800">{step.action}</span>
                                                    {step.endpoint && (
                                                        <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded text-purple-600">
                                                            {step.method} {step.endpoint}
                                                        </code>
                                                    )}
                                                    {step.data && (
                                                        <span className="ml-2 text-xs text-gray-500 italic">→ {step.data}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <h4 className="font-semibold text-gray-700 text-lg mt-6">✅ Expected Results:</h4>
                                    <ul className="space-y-1 ml-2">
                                        {scenario.expectedResults.map((result, idx) => (
                                            <li key={idx} className="text-gray-700">{result}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'database' && (
                    <div className="bg-white rounded-xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <svg className="w-8 h-8 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                            Database Schema
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Table Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Approx. Records</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {databaseSchema.tables.map((table, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <code className="bg-purple-50 text-purple-700 px-2 py-1 rounded font-mono text-sm">{table.name}</code>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{table.records}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{table.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg">
                                <h3 className="font-bold text-lg mb-3 text-blue-900">🔒 Security Features</h3>
                                <ul className="space-y-2 text-sm text-blue-800">
                                    <li>✅ Row Level Security (RLS) enabled on all tables</li>
                                    <li>✅ Role-based data access policies</li>
                                    <li>✅ Patients can only see their own data</li>
                                    <li>✅ Doctors access only assigned patients</li>
                                    <li>✅ Admin has full system access</li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg">
                                <h3 className="font-bold text-lg mb-3 text-green-900">🗂️ Data Types Used</h3>
                                <ul className="space-y-2 text-sm text-green-800">
                                    <li><strong>JSONB:</strong> medicines, vitals, insurance_details</li>
                                    <li><strong>Arrays:</strong> allergies, chronic_conditions, investigations</li>
                                    <li><strong>Enums:</strong> user_role, appointment_status</li>
                                    <li><strong>Foreign Keys:</strong> All relationships enforced</li>
                                    <li><strong>Auto-generated:</strong> UUIDs, prescription_number, token_number</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'api' && (
                    <div className="bg-white rounded-xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <svg className="w-8 h-8 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            API Endpoints (Supabase Client)
                        </h2>

                        <div className="space-y-6">
                            {apiEndpoints.map((category, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        {category.category}
                                    </h3>
                                    <div className="space-y-2">
                                        {category.endpoints.map((endpoint, endIdx) => {
                                            const parts = endpoint.split(' ');
                                            const method = parts[0];
                                            const path = parts[1];
                                            const methodColors = {
                                                GET: 'bg-blue-100 text-blue-800',
                                                POST: 'bg-green-100 text-green-800',
                                                PATCH: 'bg-yellow-100 text-yellow-800',
                                                DELETE: 'bg-red-100 text-red-800',
                                            } as any;

                                            return (
                                                <div key={endIdx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                                    <span className={`px-3 py-1 rounded font-mono text-xs font-bold ${methodColors[method]}`}>
                                                        {method}
                                                    </span>
                                                    <code className="text-sm font-mono text-gray-700">{path}</code>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                            <h3 className="font-bold text-lg mb-3 text-purple-900">📦 Service Layer Architecture</h3>
                            <p className="text-sm text-purple-800 mb-3">
                                All API calls are abstracted through service modules for cleaner code and better maintainability:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                <code className="bg-white px-3 py-2 rounded text-xs text-purple-700">appointmentService.ts</code>
                                <code className="bg-white px-3 py-2 rounded text-xs text-purple-700">doctorService.ts</code>
                                <code className="bg-white px-3 py-2 rounded text-xs text-purple-700">departmentService.ts</code>
                                <code className="bg-white px-3 py-2 rounded text-xs text-purple-700">prescriptionService.ts</code>
                                <code className="bg-white px-3 py-2 rounded text-xs text-purple-700">adminService.ts</code>
                                <code className="bg-white px-3 py-2 rounded text-xs text-purple-700">storageService.ts</code>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl p-8 text-white">
                    <h2 className="text-3xl font-bold mb-6 text-center">📚 Testing Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-5">
                            <h3 className="font-bold text-lg mb-3">📖 Documentation</h3>
                            <ul className="space-y-2 text-sm">
                                <li>• <code className="bg-white/20 px-2 py-1 rounded">prd.md</code> - Product requirements</li>
                                <li>• <code className="bg-white/20 px-2 py-1 rounded">SLOT_MANAGEMENT_GUIDE.md</code> - Slot system</li>
                                <li>• <code className="bg-white/20 px-2 py-1 rounded">functionality_analysis.md</code> - Full analysis</li>
                            </ul>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-5">
                            <h3 className="font-bold text-lg mb-3">🎯 Key Workflows</h3>
                            <ul className="space-y-2 text-sm">
                                <li>• Patient Registration → Appointment → Prescription</li>
                                <li>• OPD Walk-in → Token → Consultation</li>
                                <li>• Admin → Onboard Doctor → Set Schedule</li>
                            </ul>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-lg p-5">
                            <h3 className="font-bold text-lg mb-3">⚠️ Testing Tips</h3>
                            <ul className="space-y-2 text-sm">
                                <li>• Always check RLS policies</li>
                                <li>• Verify appointment slot availability</li>
                                <li>• Test prescription PDF generation</li>
                                <li>• Validate form submissions</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center text-gray-600">
                    <p className="text-sm">
                        💡 <strong>Pro Tip:</strong> Use browser DevTools Network tab to inspect API calls
                    </p>
                    <p className="text-sm mt-2">
                        🔍 Database inspection: Use Supabase Table Editor or SQL Editor in Supabase Dashboard
                    </p>
                </div>
            </div>
        </div>
    );
}
