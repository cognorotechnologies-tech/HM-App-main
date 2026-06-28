import { useEffect, useState } from 'react';

interface StatCounterProps {
    end: number;
    duration?: number;
    suffix?: string;
    label: string;
}

export default function StatCounter({ end, duration = 2000, suffix = '', label }: StatCounterProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = (currentTime - startTime) / duration;

            if (progress < 1) {
                setCount(Math.floor(end * progress));
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return (
        <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                {count.toLocaleString()}{suffix}
            </div>
            <div className="text-sm md:text-base text-gray-600 font-medium">
                {label}
            </div>
        </div>
    );
}
