import { Link } from 'react-router-dom';
import {
    CheckCircle, TrendingUp, Users, Building2, Stethoscope,
    DollarSign, Clock, Target, Zap, Shield, BarChart3, Award
} from 'lucide-react';

export default function ExecutiveSummary() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                        <Award className="w-5 h-5 text-yellow-300" />
                        <span className="text-sm font-semibold">For Decision Makers</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Executive Summary
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Hospital Management System - Transform Your Healthcare Practice
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* The Problem */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Target className="w-7 h-7 text-red-600" />
                        </div>
                        The Problem
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <ProblemCard text="📄 Paper-based records and manual processes" />
                        <ProblemCard text="🔍 Poor online presence and discoverability" />
                        <ProblemCard text="📅 Double bookings and scheduling chaos" />
                        <ProblemCard text="💬 Limited patient engagement tools" />
                    </div>
                </div>

                {/* The Solution */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-blue-200 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        The Solution
                    </h2>
                    <p className="text-lg text-gray-700 mb-6">
                        An all-in-one platform providing <span className="font-bold text-blue-700">7 core features</span> to digitize your practice:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <SolutionCard icon="👥" title="Patient Management" desc="Centralized digital records" />
                        <SolutionCard icon="📅" title="Smart Scheduling" desc="Online booking with reminders" />
                        <SolutionCard icon="⚡" title="Workflow Automation" desc="Automated follow-ups" />
                        <SolutionCard icon="📊" title="Campaign Management" desc="Email/SMS engagement" />
                        <SolutionCard icon="📋" title="Survey System" desc="Patient feedback tracking" />
                        <SolutionCard icon="✅" title="Staff Coordination" desc="Task management" />
                        <SolutionCard icon="📈" title="Analytics Dashboard" desc="Real-time insights" />
                    </div>
                </div>

                {/* Who It's For */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="w-7 h-7 text-purple-600" />
                        </div>
                        Who It's For
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <PersonaCard
                            icon={<Stethoscope className="w-10 h-10" />}
                            title="Individual Doctors"
                            items={[
                                "Build online presence",
                                "24/7 booking page",
                                "Digital records",
                                "Starting at $199/mo"
                            ]}
                            color="blue"
                        />
                        <PersonaCard
                            icon={<Users className="w-10 h-10" />}
                            title="Group Practices"
                            items={[
                                "Multi-doctor coordination",
                                "Shared database",
                                "Staff management",
                                "$499/mo"
                            ]}
                            color="purple"
                        />
                        <PersonaCard
                            icon={<Building2 className="w-10 h-10" />}
                            title="Hospitals"
                            items={[
                                "Complete operations",
                                "Department management",
                                "Advanced automation",
                                "Custom pricing"
                            ]}
                            color="green"
                        />
                    </div>
                </div>

                {/* Business Impact */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-xl p-8 mb-8">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        Proven Business Impact
                    </h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <ImpactMetric value="40%" label="Fewer No-Shows" />
                        <ImpactMetric value="10+ hrs" label="Saved Weekly" />
                        <ImpactMetric value="25%" label="Higher Satisfaction" />
                        <ImpactMetric value="20-30%" label="Revenue Growth" />
                    </div>
                    <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Increase Online Presence
                                </h3>
                                <ul className="space-y-2 text-green-50">
                                    <li>✓ Discoverable 24/7</li>
                                    <li>✓ Professional profiles</li>
                                    <li>✓ SEO-optimized pages</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Streamline Operations
                                </h3>
                                <ul className="space-y-2 text-green-50">
                                    <li>✓ Zero double bookings</li>
                                    <li>✓ Automated reminders</li>
                                    <li>✓ Instant data access</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROI */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <DollarSign className="w-7 h-7 text-yellow-600" />
                        </div>
                        Return on Investment
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Annual Savings</h3>
                            <div className="space-y-3">
                                <ROIItem label="Reduced no-shows" value="$10K-50K" />
                                <ROIItem label="Time savings (2-3 FTE)" value="$40K-60K" />
                                <ROIItem label="Paper reduction" value="$2K-5K" />
                                <ROIItem label="Total Savings" value="$52K-115K" highlight />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue Growth</h3>
                            <div className="space-y-3">
                                <ROIItem label="New patient acquisition" value="+30-40%" />
                                <ROIItem label="Patient retention" value="+20-25%" />
                                <ROIItem label="Revenue increase" value="+20-30%" highlight />
                            </div>
                            <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                <p className="font-bold text-lg text-green-900">Payback Period</p>
                                <p className="text-3xl font-bold text-green-700">6-12 months</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technology Highlights */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-600" />
                        Technology & Security
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <TechHighlight icon="⚛️" text="Modern React + TypeScript" />
                        <TechHighlight icon="🔒" text="Enterprise encryption" />
                        <TechHighlight icon="⚡" text="99.9% uptime SLA" />
                        <TechHighlight icon="☁️" text="Cloud-based, auto-scaling" />
                        <TechHighlight icon="🏥" text="HIPAA-ready" />
                        <TechHighlight icon="📱" text="Mobile optimized" />
                    </div>
                </div>

                {/* Pricing Quick Ref */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Pricing Overview</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <PricingCard
                            plan="Starter"
                            price="$199"
                            audience="Individual Doctors"
                            features={["Up to 500 patients", "1 doctor profile", "Basic features"]}
                        />
                        <PricingCard
                            plan="Professional"
                            price="$499"
                            audience="Group Practices"
                            features={["Up to 2,000 patients", "5 doctor profiles", "Advanced automation"]}
                            highlighted
                        />
                        <PricingCard
                            plan="Enterprise"
                            price="Custom"
                            audience="Hospitals"
                            features={["Unlimited patients", "Unlimited doctors", "Full feature access"]}
                        />
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl mb-6 text-blue-100">
                        Join 500+ healthcare providers already using our platform
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/showcase" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-xl transition-all">
                            View Full Showcase
                        </Link>
                        <Link to="/detailed-report" className="px-8 py-4 bg-transparent border-2 border-white rounded-xl font-bold hover:bg-white/10 transition-all">
                            Read Technical Report
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function ProblemCard({ text }: { text: string }) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-gray-700">
            {text}
        </div>
    );
}

function SolutionCard({ icon, title, desc }: any) {
    return (
        <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">{desc}</p>
                </div>
            </div>
        </div>
    );
}

function PersonaCard({ icon, title, items, color }: any) {
    const colors = {
        blue: 'from-blue-500 to-cyan-500',
        purple: 'from-purple-500 to-pink-500',
        green: 'from-green-500 to-emerald-500'
    };
    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} text-white mb-4`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
            <ul className="space-y-2">
                {items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ImpactMetric({ value, label }: any) {
    return (
        <div className="text-center">
            <div className="text-4xl font-bold mb-2">{value}</div>
            <div className="text-green-100">{label}</div>
        </div>
    );
}

function ROIItem({ label, value, highlight }: any) {
    return (
        <div className={`flex justify-between items-center p-3 rounded-lg ${highlight ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'}`}>
            <span className={highlight ? 'font-bold text-gray-900' : 'text-gray-700'}>{label}</span>
            <span className={`font-bold ${highlight ? 'text-2xl text-yellow-700' : 'text-lg text-gray-900'}`}>{value}</span>
        </div>
    );
}

function TechHighlight({ icon, text }: any) {
    return (
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3">
            <span className="text-xl">{icon}</span>
            <span className="text-gray-700 font-medium">{text}</span>
        </div>
    );
}

function PricingCard({ plan, price, audience, features, highlighted }: any) {
    return (
        <div className={`rounded-xl p-6 ${highlighted ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-500 shadow-lg scale-105' : 'bg-gray-50 border border-gray-200'}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan}</h3>
            <div className="text-3xl font-bold text-blue-600 mb-1">{price}</div>
            <p className="text-sm text-gray-600 mb-4">{audience}</p>
            <ul className="space-y-2">
                {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
}
