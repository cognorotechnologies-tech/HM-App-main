import { useEffect, useState } from 'react';
import { departmentService, type Department } from '../services/departmentService';
import DepartmentCard from '../components/DepartmentCard';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

export default function Departments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        departmentService.getActive()
            .then(setDepartments)
            .finally(() => setLoading(false));
    }, []);

    // Helper to get icon based on name keyword
    const getDepartmentIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('cardio') || lower.includes('heart')) return '❤️';
        if (lower.includes('neuro') || lower.includes('brain')) return '🧠';
        if (lower.includes('pedi') || lower.includes('child')) return '👶';
        if (lower.includes('ortho') || lower.includes('bone')) return '🦴';
        if (lower.includes('eye') || lower.includes('ophthal')) return '👁️';
        if (lower.includes('dent')) return '🦷';
        if (lower.includes('skin') || lower.includes('derm')) return '🧴';
        if (lower.includes('surgery')) return '🔪';
        if (lower.includes('emergency')) return '🚑';
        return '🏥'; // Default
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                        Centers of <span className="text-indigo-300">Excellence</span>
                    </h1>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
                        Specialized care across a wide range of medical disciplines, equipped with cutting-edge technology.
                    </p>
                </div>
            </section>

            {/* Departments Grid */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
                        <p className="mt-4 text-gray-500">Loading departments...</p>
                    </div>
                ) : (
                    <>
                        {departments.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl">
                                <p className="text-2xl text-gray-400 font-semibold">No active departments.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {departments.map((dept) => (
                                    <DepartmentCard
                                        key={dept.id}
                                        icon={getDepartmentIcon(dept.name)}
                                        name={dept.name}
                                        description={dept.description || ''}
                                        path={`/services`} // Redirect to services for now, or specific dept page if we had one
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* CTA */}
            <section className="bg-indigo-50 py-20">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Need guidance on which department to visit?</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Our reception desk is available 24/7 to help you direct your query to the right specialist.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/contact">
                            <Button className="bg-indigo-600 hover:bg-indigo-700">Contact Reception</Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">Book General Visit</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
