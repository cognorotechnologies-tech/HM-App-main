import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import QuickAppointmentWidget from '../components/QuickAppointmentWidget';
import TestimonialCarousel from '../components/TestimonialCarousel';
import DepartmentCard from '../components/DepartmentCard';
import DoctorCard from '../components/DoctorCard';
import { doctorService } from '../services/doctorService';

export default function Home() {
    const { user } = useAuthStore();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const data = await doctorService.getAll();
            // Take top 3
            if (data) setDoctors(data.slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch doctors', error);
        } finally {
            setLoadingDoctors(false);
        }
    };

    const featuredDepartments = [
        { icon: '❤️', name: 'Cardiology', description: 'Expert heart care and treatment', path: '/departments' },
        { icon: '🧠', name: 'Neurology', description: 'Advanced brain and nerve care', path: '/departments' },
        { icon: '👶', name: 'Pediatrics', description: 'Compassionate child healthcare', path: '/departments' },
        { icon: '🦴', name: 'Orthopedics', description: 'Bone and joint specialists', path: '/departments' },
        { icon: '👁️', name: 'Ophthalmology', description: 'Complete eye care services', path: '/departments' },
        { icon: '🦷', name: 'Dentistry', description: 'Comprehensive dental solutions', path: '/departments' },
    ];

    const services = [
        { icon: '🚑', title: '24/7 Emergency', description: 'Round-the-clock emergency medical services' },
        { icon: '🔬', title: 'Lab Services', description: 'State-of-the-art diagnostic facilities' },
        { icon: '💊', title: 'Pharmacy', description: 'In-house pharmacy with all medicines' },
        { icon: '🏥', title: 'ICU Care', description: 'Advanced intensive care units' },
        { icon: '👶', title: 'Maternity', description: 'Complete maternal and child care' },
        { icon: '🩺', title: 'OPD Services', description: 'Outpatient consultations available' },
    ];

    return (
        <div className="bg-white">
            {/* Enhanced Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 md:py-24 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left">
                            {/* Trust Badge */}
                            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                                <span className="text-yellow-300 mr-2">⭐⭐⭐⭐⭐</span>
                                <span className="text-sm font-semibold">Trusted by 50,000+ Patients</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                                Your Health,
                                <span className="block bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                                    Our Priority
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl mb-8 text-blue-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                Experience world-class healthcare with cutting-edge technology, expert doctors, and compassionate care — all accessible at your fingertips.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-12">
                                <Link to={user ? '/dashboard/patient/book' : '/login'}>
                                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-white/20 transition-all transform hover:scale-105">
                                        📅 Book Appointment
                                    </Button>
                                </Link>
                                <Link to="/departments">
                                    <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm">
                                        🏥 View Departments
                                    </Button>
                                </Link>
                            </div>

                            {/* Quick Stats - Compact Version */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
                                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-2xl md:text-3xl font-bold mb-1">50K+</div>
                                    <div className="text-xs md:text-sm text-blue-200">Patients</div>
                                </div>
                                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-2xl md:text-3xl font-bold mb-1">150+</div>
                                    <div className="text-xs md:text-sm text-blue-200">Doctors</div>
                                </div>
                                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-2xl md:text-3xl font-bold mb-1">25+</div>
                                    <div className="text-xs md:text-sm text-blue-200">Departments</div>
                                </div>
                                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-2xl md:text-3xl font-bold mb-1">30+</div>
                                    <div className="text-xs md:text-sm text-blue-200">Years</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Visual */}
                        <div className="hidden lg:block relative">
                            {/* Main Illustration */}
                            <div className="relative">
                                {/* Floating Cards - Top Left - Higher z-index */}
                                <div className="absolute -top-8 -left-8 bg-white rounded-2xl shadow-2xl p-4 animate-bounce z-20" style={{ animationDuration: '3s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">✅</div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">Appointment</div>
                                            <div className="text-xs text-gray-500">Confirmed</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Medical Icon - Lower z-index */}
                                <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-12 border-2 border-white/30 relative z-0">
                                    <div className="text-9xl text-center filter drop-shadow-2xl">🏥</div>
                                    <div className="mt-6 text-center">
                                        <div className="text-2xl font-bold mb-2">24/7 Care Available</div>
                                        <div className="text-blue-200">Round-the-clock medical services</div>
                                    </div>
                                </div>

                                {/* Floating Badge - Bottom Right - Higher z-index */}
                                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl shadow-2xl p-4 animate-bounce z-20" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-white">98%</div>
                                        <div className="text-xs text-white font-semibold">Success Rate</div>
                                    </div>
                                </div>

                                {/* Floating Badge - Top Right - Higher z-index */}
                                <div className="absolute top-1/4 -right-12 bg-white rounded-xl shadow-xl p-3 animate-pulse z-20">
                                    <div className="flex items-center gap-2">
                                        <div className="text-2xl">👨‍⚕️</div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-900">Expert Doctors</div>
                                            <div className="text-xs text-gray-500">150+ Specialists</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges Below */}
                    <div className="mt-16 pt-8 border-t border-white/20">
                        <div className="flex flex-wrap justify-center gap-8 items-center opacity-80">
                            <div className="text-center">
                                <div className="text-2xl mb-1">🏆</div>
                                <div className="text-xs text-blue-200">JCI Accredited</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl mb-1">🔒</div>
                                <div className="text-xs text-blue-200">HIPAA Compliant</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl mb-1">⚡</div>
                                <div className="text-xs text-blue-200">Instant Booking</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl mb-1">💳</div>
                                <div className="text-xs text-blue-200">All Insurance Accepted</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl mb-1">🌟</div>
                                <div className="text-xs text-blue-200">5-Star Rated</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Appointment Section */}
            <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                Book Your Appointment in Seconds
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Our streamlined booking process makes it easy to schedule consultations with top specialists. Get instant confirmation and reminders.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Choose Your Doctor</h4>
                                        <p className="text-gray-600 text-sm">Select from our panel of experienced specialists</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Pick a Time Slot</h4>
                                        <p className="text-gray-600 text-sm">View real-time availability and book instantly</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Get Confirmation</h4>
                                        <p className="text-gray-600 text-sm">Receive instant confirmation and reminders</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <QuickAppointmentWidget />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Departments */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Our Departments
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Comprehensive healthcare services across multiple specialties with state-of-the-art facilities
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredDepartments.map((dept, index) => (
                            <DepartmentCard key={index} {...dept} />
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link to="/departments">
                            <Button variant="outline" size="lg" className="px-8">
                                View All Departments
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Our Doctors */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Meet Our Doctors
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Experienced healthcare professionals dedicated to your well-being
                        </p>
                    </div>

                    {loadingDoctors ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {doctors.map((doctor) => (
                                <DoctorCard
                                    key={doctor.id}
                                    id={doctor.id}
                                    name={`${doctor.profiles?.first_name || ''} ${doctor.profiles?.last_name || ''}`}
                                    specialization={doctor.specialization || 'General Physician'}
                                    qualifications={doctor.qualifications}
                                    experience={doctor.years_of_experience}
                                />
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-10">
                        <Link to="/doctors">
                            <Button variant="primary" size="lg" className="px-8">
                                View All Doctors
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Our Services
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Comprehensive healthcare services available 24/7
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, index) => (
                            <div key={index} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow">
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                                <p className="text-gray-600">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Patient Testimonials */}
            <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">
                            What Our Patients Say
                        </h2>
                        <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                            Real experiences from real patients
                        </p>
                    </div>

                    <TestimonialCarousel />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Ready to Prioritize Your Health?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of patients who trust us with their healthcare needs
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register">
                            <Button size="lg" className="px-10 py-4 text-lg rounded-full">
                                Get Started Today
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button variant="outline" size="lg" className="px-10 py-4 text-lg rounded-full">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
