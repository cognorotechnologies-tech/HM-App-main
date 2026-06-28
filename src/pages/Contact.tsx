import { Button } from '../components/Button';
import { Input } from '../components/Input';

export default function Contact() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="bg-blue-900 text-white py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
                <div className="relative z-10 max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
                    <p className="text-xl text-blue-200">
                        We are here to help. Reach out to us for appointments, inquiries, or emergency support.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-16">
                    {/* Contact Info Side */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Have questions about our services, insurance acceptance, or need to schedule a visit? Our dedicated support team is ready to assist you.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl flex-shrink-0">
                                        📍
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">Visit Us</h4>
                                        <p className="text-gray-600">123 Health Street, Medical District</p>
                                        <p className="text-gray-600">New York, NY 10001</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl flex-shrink-0">
                                        📞
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">Call Us</h4>
                                        <p className="text-gray-600 font-medium">Emergency: +1 (555) 911-0000</p>
                                        <p className="text-gray-600">General Inquiry: +1 (555) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl flex-shrink-0">
                                        ✉️
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">Email Us</h4>
                                        <p className="text-gray-600">info@medicarehospital.com</p>
                                        <p className="text-gray-600">support@medicarehospital.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl flex-shrink-0">
                                        🕒
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">Working Hours</h4>
                                        <p className="text-gray-600">Emergency: 24/7 Open</p>
                                        <p className="text-gray-600">OPD: Mon - Sat, 8:00 AM - 8:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="bg-gray-200 h-64 rounded-2xl flex items-center justify-center text-gray-500 overflow-hidden relative">
                            {/* In a real app, embed Google Map here */}
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1626084000000!5m2!1sen!2sus"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>

                    {/* Contact Form Side */}
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h3>
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input label="First Name" placeholder="John" />
                                <Input label="Last Name" placeholder="Doe" />
                            </div>
                            <Input label="Email Address" type="email" placeholder="john@example.com" />
                            <Input label="Phone Number" placeholder="+1 (555) 000-0000" />
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <select className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
                                    <option>General Inquiry</option>
                                    <option>Appointment Issue</option>
                                    <option>Feedback</option>
                                    <option>Billing Question</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    className="block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-blue-500 focus:ring-blue-500"
                                    rows={4}
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <Button size="lg" className="w-full text-lg py-4">Send Message</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
