import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export default function About() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
                        Healing with <span className="text-cyan-400">Heart</span>,
                        <br />
                        Leading with <span className="text-blue-300">Science</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
                        At MediCare Hospital, we envision a world where world-class healthcare is compassionate, accessible, and personalized for every individual.
                    </p>
                    <Link to="/contact">
                        <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-10 py-4 text-lg font-bold rounded-full shadow-2xl transition-transform transform hover:scale-105">
                            Get in Touch
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Mission & Vision cards */}
            <section className="py-20 bg-gray-50 relative -mt-16 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-blue-500 transform hover:-translate-y-1 duration-300">
                            <div className="text-5xl mb-6">🎯</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                            <p className="text-gray-600 leading-relaxed">
                                To provide exceptional healthcare services that improve the quality of life for our community through clinical excellence and compassionate care.
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-cyan-500 transform hover:-translate-y-1 duration-300">
                            <div className="text-5xl mb-6">👁️</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                            <p className="text-gray-600 leading-relaxed">
                                To be the region's most trusted healthcare partner, recognized for medical innovation, patient safety, and holistic well-being.
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-indigo-500 transform hover:-translate-y-1 duration-300">
                            <div className="text-5xl mb-6">💎</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Integrity, Compassion, Innovation, and Excellence define every interaction and decision we make for our patients.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story / History */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600 rounded-3xl transform rotate-3 opacity-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1587351021759-3e566b9af922?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Medical Building"
                                className="relative rounded-3xl shadow-2xl z-10"
                            />
                        </div>
                        <div>
                            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm mb-6">Since 1990</div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">A Legacy of Care</h2>
                            <div className="space-y-6 text-lg text-gray-600">
                                <p>
                                    MediCare Hospital started as a small community clinic three decades ago with a single mission: to serve the underserved. Today, we stand as a beacon of medical excellence.
                                </p>
                                <p>
                                    Over the years, we have expanded to a 500-bed multi-specialty facility, pioneering treatments in cardiology, oncology, and neurology while maintaining the personal touch that defines us.
                                </p>
                                <p>
                                    Our team of over 150 specialists works tirelessly 24/7 to ensure that no patient is left behind. We don't just treat diseases; we heal people.
                                </p>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-3xl font-bold text-blue-600">30+</div>
                                    <div className="text-sm text-gray-500">Years of Service</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-blue-600">50k+</div>
                                    <div className="text-sm text-gray-500">Happy Patients</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Stats */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl font-bold mb-16">The People Behind the Care</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="p-6 border border-gray-700 rounded-2xl hover:bg-gray-800 transition-colors">
                            <div className="text-4xl font-bold text-cyan-400 mb-2">150+</div>
                            <div className="text-gray-400">Expert Doctors</div>
                        </div>
                        <div className="p-6 border border-gray-700 rounded-2xl hover:bg-gray-800 transition-colors">
                            <div className="text-4xl font-bold text-blue-400 mb-2">300+</div>
                            <div className="text-gray-400">Nursing Staff</div>
                        </div>
                        <div className="p-6 border border-gray-700 rounded-2xl hover:bg-gray-800 transition-colors">
                            <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
                            <div className="text-gray-400">Support Staff</div>
                        </div>
                        <div className="p-6 border border-gray-700 rounded-2xl hover:bg-gray-800 transition-colors">
                            <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
                            <div className="text-gray-400">Emergency Care</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
