
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackingService } from '../services/trackingService';

export function TrackingHandler() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('Recording action...');

    useEffect(() => {
        const type = window.location.pathname.includes('/open') ? 'email_open' : 'link_click';
        handleTracking(type);
    }, []);

    async function handleTracking(type: string) {
        const campaignId = searchParams.get('cid');
        const patientId = searchParams.get('pid');
        const url = searchParams.get('url');

        // Log the action
        await trackingService.trackEvent({
            action_type: type,
            workflow_instance_id: campaignId || undefined,
            patient_id: patientId || undefined,
            action_data: { url },
            user_agent: navigator.userAgent
        });

        // Redirect if it's a click
        if (type === 'link_click' && url) {
            window.location.href = url;
        } else if (type === 'email_open') {
            setStatus('Pixel loaded (simulated)');
        } else {
            setStatus('Invalid tracking request');
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{status}</p>
            </div>
        </div>
    );
}
