import { Link } from 'react-router-dom';
import {
    Activity, Users, Calendar, MessageSquare, BarChart3, Shield,
    Clock, FileText, Zap, Heart, TrendingUp, CheckCircle,
    Stethoscope, Building2, UserPlus, Mail, Database, Workflow
} from 'lucide-react';

export default function ProductShowcase() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
                            <Heart className="w-5 h-5 text-red-400" />
                            <span className="text-sm font-semibold">Complete Healthcare Management Solution</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Transform Your
                            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Healthcare Practice
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
                            All-in-one platform to manage patients, appointments, staff, and operations while building your digital presence
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register">
                                <button className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105">
                                    Start Free Trial
                                </button>
                            </Link>
                            <a href="#features">
                                <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                                    Explore Features
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatCard icon={<Users />} number="500+" label="Healthcare Providers" color="blue" />
                        <StatCard icon={<Activity />} number="10K+" label="Patient Records" color="green" />
                        <StatCard icon={<Calendar />} number="99.9%" label="Uptime Reliability" color="purple" />
                        <StatCard icon={<TrendingUp />} number="40%" label="Efficiency Boost" color="orange" />
                    </div>
                </div>
            </section>

            {/* Who Is This For Section */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Built For Every Healthcare Provider
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            From solo practitioners to multi-specialty hospitals, our platform scales with your needs
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <PersonaCard
                            icon={<Stethoscope className="w-12 h-12" />}
                            title="Individual Doctors"
                            description="Perfect for solo practitioners looking to digitize their practice, manage appointments, and build online presence"
                            features={[
                                "Personal doctor profile & booking page",
                                "Patient management & history",
                                "Appointment scheduling",
                                "Digital prescriptions & records"
                            ]}
                            gradient="from-blue-500 to-cyan-500"
                        />
                        <PersonaCard
                            icon={<Users className="w-12 h-12" />}
                            title="Group Practices"
                            description="Ideal for clinics with multiple doctors (dentists, specialists, etc.) needing coordinated patient care"
                            features={[
                                "Multi-doctor scheduling",
                                "Shared patient database",
                                "Staff task management",
                                "Department organization"
                            ]}
                            gradient="from-purple-500 to-pink-500"
                        />
                        <PersonaCard
                            icon={<Building2 className="w-12 h-12" />}
                            title="Hospitals"
                            description="Comprehensive solution for hospitals managing complex operations, departments, and large patient volumes"
                            features={[
                                "Full hospital operations",
                                "Department management",
                                "Workflow automation",
                                "Campaign & analytics"
                            ]}
                            gradient="from-green-500 to-emerald-500"
                        />
                    </div>
                </div>
            </section>

            {/* Key Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Powerful Features, Simple Experience
                        </h2>
                        <p className="text-xl text-gray-600">Everything you need to run a modern healthcare practice</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="w-8 h-8" />}
                            title="Patient Management"
                            description="Comprehensive patient profiles with medical history, appointments, and communication tools"
                            color="blue"
                        />
                        <FeatureCard
                            icon={<Calendar className="w-8 h-8" />}
                            title="Smart Scheduling"
                            description="Intelligent appointment booking with automated reminders and conflict prevention"
                            color="purple"
                        />
                        <FeatureCard
                            icon={<Workflow className="w-8 h-8" />}
                            title="Workflow Automation"
                            description="Automate follow-ups, medication reminders, and patient care journeys"
                            color="teal"
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-8 h-8" />}
                            title="Patient Surveys"
                            description="Collect feedback with customizable surveys and sentiment analysis"
                            color="indigo"
                        />
                        <FeatureCard
                            icon={<Mail className="w-8 h-8" />}
                            title="Campaign Management"
                            description="Engage patients with email/SMS campaigns for health tips and updates"
                            color="pink"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-8 h-8" />}
                            title="Analytics & Insights"
                            description="Track performance, patient trends, and business metrics in real-time"
                            color="orange"
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8" />}
                            title="Secure & Compliant"
                            description="HIPAA-ready with role-based access and encrypted data storage"
                            color="green"
                        />
                        <FeatureCard
                            icon={<Database className="w-8 h-8" />}
                            title="Centralized Data"
                            description="All patient information in one secure, searchable location"
                            color="blue"
                        />
                        <FeatureCard
                            icon={<Zap className="w-8 h-8" />}
                            title="Fast & Reliable"
                            description="Lightning-fast performance with 99.9% uptime guarantee"
                            color="yellow"
                        />
                    </div>
                </div>
            </section>

            {/* Business Impact Section */}
            <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Real Business Impact
                        </h2>
                        <p className="text-xl text-indigo-200">See how our platform transforms healthcare practices</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <ImpactCard
                            icon={<TrendingUp />}
                            title="Increase Online Presence"
                            points={[
                                "Professional doctor profiles visible to patients",
                                "Online appointment booking 24/7",
                                "SEO-optimized pages for better discoverability",
                                "Patient reviews and ratings system"
                            ]}
                        />
                        <ImpactCard
                            icon={<Zap />}
                            title="Streamline Operations"
                            points={[
                                "Reduce no-shows by 40% with automated reminders",
                                "Save 10+ hours/week on administrative tasks",
                                "Eliminate double bookings and scheduling conflicts",
                                "Quick access to patient history during consultations"
                            ]}
                        />
                        <ImpactCard
                            icon={<Database />}
                            title="Better Data Management"
                            points={[
                                "Centralized patient records accessible anywhere",
                                "Automated backup and disaster recovery",
                                "Search and retrieve information instantly",
                                "Generate reports and insights with one click"
                            ]}
                        />
                        <ImpactCard
                            icon={<Heart />}
                            title="Improve Patient Care"
                            points={[
                                "Proactive follow-ups through automated workflows",
                                "Medication adherence tracking and reminders",
                                "Patient satisfaction surveys",
                                "Personalized care journey automation"
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Built with Modern Technology
                        </h2>
                        <p className="text-xl text-gray-600">Reliable, scalable, and secure infrastructure</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <TechCard
                            title="Frontend"
                            technologies={["React + TypeScript", "Tailwind CSS", "Vite Build System", "Real-time Updates"]}
                            icon="⚛️"
                        />
                        <TechCard
                            title="Backend"
                            technologies={["Supabase (PostgreSQL)", "Real-time Database", "Authentication & RLS", "Edge Functions"]}
                            icon="🔒"
                        />
                        <TechCard
                            title="Features"
                            technologies={["Workflow Engine", "Campaign Manager", "Survey Builder", "Analytics Dashboard"]}
                            icon="⚡"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Transform Your Practice?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join hundreds of healthcare providers already using our platform
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/50 transition-all transform hover:scale-105">
                                Start Free Trial
                            </button>
                        </Link>
                        <a href="/detailed-report" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                            View Technical Report
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer Links */}
            <div className="bg-gray-900 text-gray-400 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <a href="/detailed-report" className="hover:text-white transition-colors">📄 Detailed Technical Report</a>
                        <a href="/executive-summary" className="hover:text-white transition-colors">📊 Executive Summary</a>
                        <Link to="/doctors" className="hover:text-white transition-colors">👨‍⚕️ Our Doctors</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">📞 Contact Us</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function StatCard({ icon, number, label, color }: any) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        purple: 'text-purple-600 bg-purple-50',
        orange: 'text-orange-600 bg-orange-50'
    };
    return (
        <div className="text-center">
            <div className={`inline-flex p-4 rounded-xl ${colors[color as keyof typeof colors]} mb-4`}>
                {icon}
            </div>
            <div className="text-3xl font-bold text-gray-900">{number}</div>
            <div className="text-gray-600">{label}</div>
        </div>
    );
}

function PersonaCard({ icon, title, description, features, gradient }: any) {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105">
            <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} text-white mb-6`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 mb-6">{description}</p>
            <ul className="space-y-3">
                {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: any) {
    const colors = {
        blue: 'from-blue-500 to-cyan-500',
        purple: 'from-purple-500 to-pink-500',
        teal: 'from-teal-500 to-cyan-500',
        indigo: 'from-indigo-500 to-purple-500',
        pink: 'from-pink-500 to-rose-500',
        orange: 'from-orange-500 to-amber-500',
        green: 'from-green-500 to-emerald-500',
        yellow: 'from-yellow-500 to-orange-500'
    };
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all group">
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colors[color as keyof typeof colors]} text-white mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}

function ImpactCard({ icon, title, points }: any) {
    return (
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/20 rounded-xl">
                    {icon}
                </div>
                <h3 className="text-2xl font-bold">{title}</h3>
            </div>
            <ul className="space-y-3">
                {points.map((point: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-indigo-100">{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function TechCard({ title, technologies, icon }: any) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
            <ul className="space-y-2">
                {technologies.map((tech: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>{tech}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
