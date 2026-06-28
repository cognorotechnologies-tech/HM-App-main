import { useEffect, useState } from 'react';
import { doctorService, type Doctor } from '../services/doctorService';
import DoctorCard from '../components/DoctorCard';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

export default function Doctors() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        doctorService.getAll().then(allDocs => {
            setDoctors(allDocs);
        }).finally(() => setLoading(false));
    }, []);

    // Helper to generate deterministic visual image
    const getDoctorImage = (id: string) => {
        // Use id to pick a consistent image no matter when we reload
        // Simple hash of the ID to get a number 0-9
        const seed = id.charCodeAt(0) + (id.length > 5 ? id.charCodeAt(5) : 0);
        const index = seed % 6;

        // Curated high-quality doctor portraits (Professional, brighter, diverse)
        const images = [
            'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80', // Male, blue background
            'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=500&q=80', // Female, smiling
            'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80', // Male, glasses
            'https://images.unsplash.com/photo-1559839734-2b71ea860c25?auto=format&fit=crop&w=500&q=80', // Female, scrubs
            'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=500&q=80', // Male, specialist
            'https://images.unsplash.com/photo-1651008325506-71d34559203c?auto=format&fit=crop&w=500&q=80'  // Female, white coat
        ];

        return images[index];
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1559839734-2b71ea860c25?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                        Meet Our <span className="text-cyan-400">Specialists</span>
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                        Our team of experienced doctors is dedicated to providing you with the highest standard of medical care.
                    </p>
                </div>
            </section>

            {/* Doctors Grid */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                        <p className="mt-4 text-gray-500">Loading doctors...</p>
                    </div>
                ) : (
                    <>
                        {doctors.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl">
                                <p className="text-2xl text-gray-400 font-semibold">No doctors found.</p>
                                <p className="text-gray-500 mt-2">Check back later for updates.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {doctors.map((doc) => (
                                    <DoctorCard
                                        key={doc.id}
                                        id={doc.id}
                                        name={`${doc.profiles?.first_name || 'Unknown'} ${doc.profiles?.last_name || ''}`}
                                        specialization={doc.specialization || 'Specialist'}
                                        qualifications={doc.qualifications || undefined}
                                        experience={doc.years_of_experience || undefined}
                                        imageUrl={getDoctorImage(doc.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* CTA */}
            <section className="bg-gray-50 py-16 text-center border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Are you a qualified doctor?</h2>
                    <p className="text-gray-600 mb-8">Join our team of excellence and help us make a difference in people's lives.</p>
                    <Link to="/contact">
                        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Career Opportunities</Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
