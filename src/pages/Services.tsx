import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export default function Services() {
    const serviceCategories = [
        {
            title: "Outpatient Services",
            description: "Expert consultation and care without the need for hospitalization.",
            icon: "🩺",
            services: [
                { name: "General Consultation", desc: "Routine check-ups and primary care." },
                { name: "Specialized Clinics", desc: "Diabetes, asthma, and cardiac clinics." },
                { name: "Vaccinations", desc: "Immunization for all age groups." },
                { name: "Wellness Checkups", desc: "Comprehensive health screening packages." },
            ]
        },
        {
            title: "Inpatient Care",
            description: "Comfortable and safe hospitalization with round-the-clock monitoring.",
            icon: "🛏️",
            services: [
                { name: "Intensive Care Units", desc: "Advanced ICU, NICU, and CICU." },
                { name: "Surgical Wards", desc: "Post-operative recovery suites." },
                { name: "Maternity Wing", desc: "Labor rooms and neonatal care." },
                { name: "Private Suites", desc: "Premium rooms for patient comfort." },
            ]
        },
        {
            title: "Diagnostics & Imaging",
            description: "State-of-the-art technology for accurate and quick diagnosis.",
            icon: "🔬",
            services: [
                { name: "MRI & CT Scan", desc: "High-resolution diagnostic imaging." },
                { name: "Pathology Lab", desc: "24/7 automated blood testing." },
                { name: "X-Ray & Ultrasound", desc: "Digital radiography and sonography." },
                { name: "Cardiac Screening", desc: "ECG, Echo, and Stress Tests." },
            ]
        },
        {
            title: "Emergency & Trauma",
            description: "Ready to handle any medical emergency 24 hours a day.",
            icon: "🚑",
            services: [
                { name: "Ambulance Fleet", desc: "ACLS equipped rapid response units." },
                { name: "Trauma Center", desc: "Level 1 care for critical injuries." },
                { name: "Emergency Surgery", desc: "Immediate life-saving procedures." },
                { name: "24/7 Pharmacy", desc: "In-house access to critical medicines." },
            ]
        }
    ];

    const processSteps = [
        { title: "Book Appointment", desc: "Schedule online or call us anytime.", icon: "📅" },
        { title: "Consultation", desc: "Meet our expert specialists.", icon: "👨‍⚕️" },
        { title: "Diagnosis", desc: "Accurate testing and analysis.", icon: "📋" },
        { title: "Treatment", desc: "Personalized care and recovery.", icon: "💊" }
    ];

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Hero Section */}
            <header className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1516549655169-df83a0833860?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300 text-sm font-semibold mb-6 animate-fade-in-up">World-Class Healthcare</span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
                        Excellence in <span className="text-blue-400">Medical Service</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                        Combining advanced technology with compassionate care to ensure the best possible outcomes for every patient.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/contact">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 border-none shadow-blue-900/50 shadow-lg px-8 py-4 rounded-full font-bold transition-transform transform hover:-translate-y-1">
                                Get in Touch
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Patient Journey Flow */}
            <section className="py-20 bg-white relative z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Your Path to Health</h2>
                        <p className="text-gray-500 mt-2">Seamless care process focused on you</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-blue-100 -z-10 w-3/4 mx-auto"></div>

                        {processSteps.map((step, idx) => (
                            <div key={idx} className="text-center relative">
                                <div className="w-24 h-24 bg-white border-4 border-blue-50 rounded-full flex items-center justify-center text-4xl shadow-sm mx-auto mb-6 z-10 relative">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                                <p className="text-gray-500 text-sm px-4">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Services Grid */}
            <div className="bg-gray-50 py-24">
                <div className="max-w-7xl mx-auto px-4 space-y-32">
                    {serviceCategories.map((category, idx) => (
                        <div key={idx} className={`flex flex-col lg:flex-row gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                            <div className="lg:w-1/3 text-center lg:text-left">
                                <span className="text-6xl mb-6 block">{category.icon}</span>
                                <h2 className="text-4xl font-bold text-gray-900 mb-6">{category.title}</h2>
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">{category.description}</p>
                                <ul className="space-y-4 mb-8 text-gray-600 text-left mx-auto lg:mx-0 max-w-sm">
                                    <li className="flex items-center gap-3">
                                        <span className="text-green-500">✓</span> Experienced Specialists
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-green-500">✓</span> Latest Technology
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="text-green-500">✓</span> Patient-Centric Approach
                                    </li>
                                </ul>
                                <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600">View Department</Button>
                            </div>

                            <div className="lg:w-2/3 grid sm:grid-cols-2 gap-6 w-full">
                                {category.services.map((service, sIdx) => (
                                    <div key={sIdx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group">
                                        <div className="w-12 h-1 bg-blue-200 mb-6 group-hover:bg-blue-600 transition-colors"></div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                                        <p className="text-gray-500 leading-relaxed">{service.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Technology Section */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Advanced Technology</h2>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                We believe in empowering our doctors with the best tools available.
                                Our facility is equipped with the latest generation of medical technology to ensure precision in every diagnosis and procedure.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-2xl font-bold text-blue-400 mb-2">3T MRI</h4>
                                    <p className="text-sm text-slate-400">Higher resolution scanning for detailed neurology and orthopedics.</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-blue-400 mb-2">Robotic Surgery</h4>
                                    <p className="text-sm text-slate-400">Minimally invasive procedures with da Vinci Surgical Systems.</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-blue-400 mb-2">AI Labs</h4>
                                    <p className="text-sm text-slate-400">AI-assisted diagnosis for faster and more accurate pathology results.</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-blue-400 mb-2">Smart ICU</h4>
                                    <p className="text-sm text-slate-400">Integrated patient monitoring systems with real-time analytics.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                            <img
                                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Advanced Medical Technology"
                                className="relative rounded-2xl shadow-2xl border border-slate-700 z-10"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-blue-600 py-16 text-center text-white">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6">Ready to Experience Better Care?</h2>
                    <div className="flex justify-center gap-4">
                        <Link to="/login">
                            <Button className="bg-white text-blue-900 hover:bg-gray-100 font-bold px-8 py-3 rounded-full">Book Your Visit</Button>
                        </Link>
                        <Link to="/contact">
                            <Button variant="outline" className="border-white text-white hover:bg-blue-700 px-8 py-3 rounded-full">Contact Us</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
