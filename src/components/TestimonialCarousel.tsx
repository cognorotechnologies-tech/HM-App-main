import { useState, useEffect } from 'react';

interface Testimonial {
    id: number;
    name: string;
    rating: number;
    feedback: string;
    treatment: string;
    date: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: 'Sarah Johnson',
        rating: 5,
        feedback: 'Excellent care and professional staff. The online booking system made it so easy to schedule my appointment. Highly recommend!',
        treatment: 'Cardiology Consultation',
        date: 'January 2024'
    },
    {
        id: 2,
        name: 'Michael Chen',
        rating: 5,
        feedback: 'The doctors here are amazing! They took the time to explain everything clearly. The facility is modern and clean.',
        treatment: 'Orthopedic Surgery',
        date: 'December 2023'
    },
    {
        id: 3,
        name: 'Emily Rodriguez',
        rating: 5,
        feedback: 'Great experience from start to finish. The staff was friendly and the treatment was top-notch. Thank you!',
        treatment: 'Pediatrics Visit',
        date: 'January 2024'
    }
];

export default function TestimonialCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const currentTestimonial = testimonials[currentIndex];

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-4">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                    ))}
                </div>

                {/* Feedback */}
                <p className="text-lg text-gray-700 italic mb-6">
                    "{currentTestimonial.feedback}"
                </p>

                {/* Author */}
                <div>
                    <p className="font-semibold text-gray-900">{currentTestimonial.name}</p>
                    <p className="text-sm text-gray-500">{currentTestimonial.treatment}</p>
                    <p className="text-xs text-gray-400 mt-1">{currentTestimonial.date}</p>
                </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300'
                            }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
