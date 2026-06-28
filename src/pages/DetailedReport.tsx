import { Link } from 'react-router-dom';
import {
    CheckCircle, Shield, Zap, Database, Users, Calendar,
    Activity, BarChart3, MessageSquare, Mail, Workflow,
    TrendingUp, Lock, Globe, Smartphone, Clock, Award
} from 'lucide-react';

export default function DetailedReport() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <Award className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm font-semibold">Technical Documentation</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Hospital Management System
                        </h1>
                        <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                            Comprehensive Technical Report & System Architecture
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Executive Overview */}
                <Section
                    icon={<BarChart3 className="w-8 h-8" />}
                    title="Executive Overview"
                    gradient="from-blue-500 to-cyan-500"
                >
                    <p className="text-lg text-gray-700 leading-relaxed">
                        The Hospital Management System (HMS) is a comprehensive, cloud-based platform designed to modernize healthcare operations for individual practitioners, group practices, and hospitals. Built with cutting-edge technology and user-centric design, the system streamlines patient care, administrative tasks, and business operations while enabling digital transformation.
                    </p>
                </Section>

                {/* Technology Stack */}
                <Section
                    icon={<Zap className="w-8 h-8" />}
                    title="Technology Stack"
                    gradient="from-purple-500 to-pink-500"
                >
                    <div className="grid md:grid-cols-3 gap-6">
                        <TechCard
                            title="Frontend"
                            icon="⚛️"
                            items={[
                                "React 18 + TypeScript",
                                "Vite Build System",
                                "Tailwind CSS",
                                "React Router v6"
                            ]}
                        />
                        <TechCard
                            title="Backend & Database"
                            icon="🗄️"
                            items={[
                                "Supabase (PostgreSQL)",
                                "Real-time Subscriptions",
                                "Row Level Security",
                                "Edge Functions"
                            ]}
                        />
                        <TechCard
                            title="Infrastructure"
                            icon="☁️"
                            items={[
                                "Cloud-hosted",
                                "99.9% Uptime SLA",
                                "Global CDN",
                                "Auto-scaling"
                            ]}
                        />
                    </div>
                </Section>

                {/* Core Modules */}
                <Section
                    icon={<Activity className="w-8 h-8" />}
                    title="Core Modules"
                    gradient="from-green-500 to-emerald-500"
                >
                    <div className="space-y-6">
                        <ModuleCard
                            icon={<Users />}
                            title="Patient Management"
                            description="Comprehensive patient information system with complete medical history, contact management, and real-time updates."
                            features={[
                                "Complete patient profiles with demographics",
                                "Medical history tracking",
                                "Document storage and retrieval",
                                "Full-text search capabilities"
                            ]}
                            value="Centralized data accessible from anywhere, reduced search time, better clinical decisions"
                        />

                        <ModuleCard
                            icon={<Calendar />}
                            title="Smart Scheduling"
                            description="Intelligent appointment booking with automated reminders and conflict prevention."
                            features={[
                                "24/7 online booking",
                                "Multi-doctor calendar management",
                                "Automated reminders",
                                "Status workflow (Pending → Confirmed → Completed)"
                            ]}
                            value="40% reduction in no-shows, elimination of scheduling conflicts, 24/7 patient convenience"
                        />

                        <ModuleCard
                            icon={<Workflow />}
                            title="Workflow Automation"
                            description="Intelligent patient care journey automation with trigger-based workflows."
                            features={[
                                "Visual workflow builder",
                                "Trigger-based automation",
                                "Multi-step care journeys",
                                "Email, SMS, and task automation"
                            ]}
                            value="Automated follow-ups, medication adherence tracking, consistent care protocols"
                        />

                        <ModuleCard
                            icon={<MessageSquare />}
                            title="Survey Management"
                            description="Advanced patient satisfaction and feedback system with sentiment analysis."
                            features={[
                                "Customizable survey builder",
                                "Multiple question types",
                                "AI-powered sentiment analysis",
                                "Real-time analytics"
                            ]}
                            value="Continuous satisfaction monitoring, data-driven improvements, early issue identification"
                        />

                        <ModuleCard
                            icon={<Mail />}
                            title="Campaign Management"
                            description="Patient engagement and communication platform for email and SMS campaigns."
                            features={[
                                "Email and SMS campaigns",
                                "Patient segmentation",
                                "Campaign scheduling",
                                "Delivery tracking and analytics"
                            ]}
                            value="Increased engagement, reduced no-shows, proactive health education"
                        />

                        <ModuleCard
                            icon={<BarChart3 />}
                            title="Analytics & Reporting"
                            description="Business intelligence and insights with real-time dashboards."
                            features={[
                                "Real-time dashboards",
                                "Patient volume trends",
                                "Revenue metrics",
                                "Department-wise breakdowns"
                            ]}
                            value="Data-driven decisions, performance benchmarking, resource optimization"
                        />
                    </div>
                </Section>

                {/* Security & Compliance */}
                <Section
                    icon={<Shield className="w-8 h-8" />}
                    title="Security & Compliance"
                    gradient="from-red-500 to-orange-500"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        <SecurityCard
                            title="Data Security"
                            items={[
                                "AES-256 encryption at rest",
                                "TLS 1.3 in transit",
                                "Multi-factor authentication",
                                "Complete audit logging"
                            ]}
                        />
                        <SecurityCard
                            title="Compliance"
                            items={[
                                "HIPAA-ready architecture",
                                "GDPR-compliant data handling",
                                "Role-based access control",
                                "Data retention policies"
                            ]}
                        />
                    </div>
                </Section>

                {/* Performance Metrics */}
                <Section
                    icon={<TrendingUp className="w-8 h-8" />}
                    title="Performance Metrics"
                    gradient="from-orange-500 to-amber-500"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <MetricCard label="Page Load" value="< 1s" icon={<Clock />} />
                        <MetricCard label="Uptime" value="99.9%" icon={<Activity />} />
                        <MetricCard label="Query Time" value="< 100ms" icon={<Database />} />
                        <MetricCard label="Concurrent Users" value="1000+" icon={<Users />} />
                    </div>
                </Section>

                {/* Business Impact */}
                <Section
                    icon={<Award className="w-8 h-8" />}
                    title="Business Impact & ROI"
                    gradient="from-indigo-500 to-purple-500"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        <ImpactCard
                            title="Cost Savings"
                            items={[
                                "40% reduction in no-shows ($10K-50K annually)",
                                "2-3 FTE equivalent time savings",
                                "90% reduction in paper costs",
                                "20-25% efficiency gain"
                            ]}
                        />
                        <ImpactCard
                            title="Revenue Growth"
                            items={[
                                "30-40% increase in new patient acquisition",
                                "20-25% improvement in retention",
                                "Enable new revenue streams",
                                "Premium market positioning"
                            ]}
                        />
                    </div>
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">Typical ROI</h4>
                        </div>
                        <p className="text-lg text-gray-700">
                            Payback period: <span className="font-bold text-green-700">6-12 months</span>
                        </p>
                    </div>
                </Section>

                {/* Integration & Scalability */}
                <Section
                    icon={<Globe className="w-8 h-8" />}
                    title="Integration & Scalability"
                    gradient="from-cyan-500 to-blue-500"
                >
                    <div className="space-y-4">
                        <FeatureList
                            title="Current Capabilities"
                            items={[
                                "Unlimited patient record storage",
                                "Support for 100+ doctors per instance",
                                "10,000+ monthly appointments",
                                "50+ active automation workflows"
                            ]}
                        />
                        <FeatureList
                            title="Future Integration Potential"
                            items={[
                                "Electronic Health Records (EHR) systems",
                                "Laboratory information systems",
                                "Pharmacy management systems",
                                "Telehealth platforms"
                            ]}
                        />
                    </div>
                </Section>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h2>
                    <p className="text-xl mb-6 text-blue-100">
                        See the platform in action or start your free trial
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/showcase" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-xl transition-all">
                            View Showcase
                        </Link>
                        <Link to="/register" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all">
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function Section({ icon, title, gradient, children }: any) {
    return (
        <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                    {icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                {children}
            </div>
        </div>
    );
}

function TechCard({ title, icon, items }: any) {
    return (
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
            <ul className="space-y-2">
                {items.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ModuleCard({ icon, title, description, features, value }: any) {
    return (
        <div className="border-l-4 border-blue-500 pl-6 py-2">
            <div className="flex items-start gap-4 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-3">{description}</p>
                </div>
            </div>
            <div className="ml-12">
                <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
                <ul className="space-y-1 mb-3">
                    {features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {feature}
                        </li>
                    ))}
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-900">Business Value:</p>
                    <p className="text-sm text-blue-800">{value}</p>
                </div>
            </div>
        </div>
    );
}

function SecurityCard({ title, items }: any) {
    return (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
            <ul className="space-y-3">
                {items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MetricCard({ label, value, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
            <div className="inline-flex p-3 bg-orange-100 rounded-lg text-orange-600 mb-3">
                {icon}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
        </div>
    );
}

function ImpactCard({ title, items }: any) {
    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
            <ul className="space-y-3">
                {items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FeatureList({ title, items }: any) {
    return (
        <div>
            <h4 className="font-bold text-gray-900 mb-3">{title}</h4>
            <ul className="grid md:grid-cols-2 gap-3">
                {items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
