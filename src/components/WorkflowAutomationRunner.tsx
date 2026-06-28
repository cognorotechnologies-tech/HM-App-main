import { useEffect } from 'react';
import { workflowService } from '../services/workflowService';

const AUTOMATION_INTERVAL = 30000; // 30 seconds

export default function WorkflowAutomationRunner() {
    useEffect(() => {
        // Run immediately on mount
        runAutomation();

        // Set up interval
        const intervalId = setInterval(runAutomation, AUTOMATION_INTERVAL);

        return () => clearInterval(intervalId);
    }, []);

    const runAutomation = async () => {
        try {
            console.log('🔄 background: Running automation cycle...');
            const result = await workflowService.runAutomationCycle();
            if (result.processed > 0 || result.errors > 0) {
                console.log('✅ background: Automation cycle complete', result);
            }
        } catch (error) {
            console.error('❌ background: Automation cycle failed', error);
        }
    };

    return null; // Headless component
}
