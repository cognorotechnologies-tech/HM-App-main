import { Link } from 'react-router-dom';

interface DepartmentCardProps {
    icon: string;
    name: string;
    description: string;
    path: string;
}

export default function DepartmentCard({ icon, name, description, path }: DepartmentCardProps) {
    return (
        <Link to={path}>
            <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6 h-full border border-gray-100 hover:border-blue-200">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    {description}
                </p>
                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    Learn More
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
