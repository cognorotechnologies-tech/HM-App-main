import { useEffect, useState } from 'react';

/**
 * Hook for animating number counters with easing
 * @param endValue - The target number to count to
 * @param duration - Animation duration in milliseconds (default: 2000)
 * @param startValue - Starting value (default: 0)
 */
export function useCounterAnimation(
    endValue: number,
    duration: number = 2000,
    startValue: number = 0
): number {
    const [count, setCount] = useState(startValue);

    useEffect(() => {
        if (endValue === startValue) {
            setCount(endValue);
            return;
        }

        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCount(Math.floor(easeOut * (endValue - startValue) + startValue));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }, [endValue, duration, startValue]);

    return count;
}
