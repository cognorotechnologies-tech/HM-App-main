import { Link } from 'react-router-dom';
import { Button } from './Button';

interface DoctorCardProps {
    id: string;
    name: string;
    specialization: string;
    qualifications?: string;
    experience?: number;
    imageUrl?: string;
}

export default function DoctorCard({
    id,
    name,
    specialization,
    qualifications,
    experience,
    imageUrl
}: DoctorCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Doctor Image */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-48 flex items-center justify-center">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover object-top" />
                ) : (
                    <div className="text-6xl">👨‍⚕️</div>
                )}
            </div>

            {/* Doctor Info */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Dr. {name}
                </h3>
                <p className="text-blue-600 font-semibold text-sm mb-3">
                    {specialization}
                </p>

                {qualifications && (
                    <p className="text-gray-600 text-xs mb-2">
                        {qualifications}
                    </p>
                )}

                {experience && (
                    <p className="text-gray-500 text-xs mb-4">
                        {experience}+ years experience
                    </p>
                )}

                <div className="flex gap-2">
                    <Link to={`/doctors/${id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                            View Profile
                        </Button>
                    </Link>
                    <Link to="/login" className="flex-1">
                        <Button variant="primary" size="sm" className="w-full">
                            Book
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
