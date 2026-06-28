import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService, type Doctor } from '../services/doctorService';
import { Button } from '../components/Button';

export default function DoctorProfile() {
    const { id } = useParams<{ id: string }>();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            doctorService.getById(id)
                .then(setDoctor)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!doctor) return (
        <div className="text-center py-20 min-h-screen flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Doctor Not Found</h2>
            <Link to="/doctors">
                <Button>Back to Doctors</Button>
            </Link>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link to="/doctors" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium">
                    ← Back to All Doctors
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid md:grid-cols-3">
                        {/* Image Section */}
                        <div className="bg-blue-600 h-96 md:h-auto flex items-center justify-center relative">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
                            <div className="text-9xl relative z-10 filter drop-shadow-lg">
                                👨‍⚕️
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="md:col-span-2 p-8 md:p-12">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                        Dr. {doctor.profiles?.first_name} {doctor.profiles?.last_name}
                                    </h1>
                                    <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        {doctor.specialization}
                                    </div>
                                </div>
                                <Link to="/login">
                                    <Button size="lg" className="shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                                        Book Appointment
                                    </Button>
                                </Link>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span>🎓</span> Qualifications
                                    </h3>
                                    <p className="text-lg text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        {doctor.qualifications || 'Not specified'}
                                    </p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span>⭐</span> Experience
                                        </h3>
                                        <div className="text-3xl font-bold text-blue-600">
                                            {doctor.years_of_experience || 0} <span className="text-lg text-gray-500 font-normal">Years</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span>🏥</span> Department
                                        </h3>
                                        <div className="text-lg text-gray-700">
                                            {doctor.departments?.name || 'General Medicine'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span>💬</span> About
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Dr. {doctor.profiles?.last_name} is a highly skilled professional dedicated to patient care.
                                        With extensive experience in {doctor.specialization?.toLowerCase() || 'medical practice'},
                                        they ensure the best possible treatment outcomes using modern medical practices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
