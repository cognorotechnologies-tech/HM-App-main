import { workflowService } from './workflowService';

/**
 * Workflow Automation Engine
 * Continuously runs workflow automation cycles to execute scheduled workflows
 */
class WorkflowAutomationEngine {
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isRunning: boolean = false;
    private cycleIntervalMs: number = 60000; // 1 minute default

    /**
     * Start the automation engine
     * @param intervalMs - How often to run the automation cycle (default: 60000ms = 1 minute)
     */
    start(intervalMs: number = 60000) {
        if (this.isRunning) {
            console.warn('[Automation Engine] Already running');
            return;
        }

        this.cycleIntervalMs = intervalMs;
        this.isRunning = true;

        console.log(`[Automation Engine] Starting... (cycle every ${intervalMs}ms)`);

        // Wait 3 seconds for Supabase to initialize before first cycle
        setTimeout(() => {
            if (this.isRunning) {
                this.runCycle();
            }
        }, 3000);

        // Then run on interval
        this.intervalId = setInterval(() => {
            this.runCycle();
        }, intervalMs);
    }

    /**
     * Stop the automation engine
     */
    stop() {
        if (!this.isRunning) {
            console.warn('[Automation Engine] Not running');
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        console.log('[Automation Engine] Stopped');
    }

    /**
     * Run a single automation cycle with retry logic
     * This processes all workflows that are ready to execute
     */
    private async runCycle() {
        if (!this.isRunning) return;

        const cycleStartTime = Date.now();
        console.log('[Automation Engine] Starting cycle...');

        try {
            // Run the workflow automation cycle with retry logic
            await this.runWithRetry(
                () => workflowService.runAutomationCycle(),
                3 // Max 3 retries
            );

            const cycleEndTime = Date.now();
            const cycleDuration = cycleEndTime - cycleStartTime;

            console.log(`[Automation Engine] Cycle complete in ${cycleDuration}ms`);

            // Log if cycle took longer than interval (potential performance issue)
            if (cycleDuration > this.cycleIntervalMs) {
                console.warn(
                    `[Automation Engine] WARNING: Cycle took ${cycleDuration}ms, ` +
                    `which is longer than interval ${this.cycleIntervalMs}ms`
                );
            }
        } catch (error) {
            console.error('[Automation Engine] Cycle failed after retries:', error);
            // Continue running despite errors - don't crash the engine
        }
    }

    /**
     * Execute a function with exponential backoff retry
     */
    private async runWithRetry<T>(
        fn: () => Promise<T>,
        maxRetries: number
    ): Promise<T> {
        let lastError: any;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                if (attempt < maxRetries) {
                    // Exponential backoff: 2^attempt seconds
                    const delayMs = Math.pow(2, attempt) * 1000;
                    console.warn(
                        `[Automation Engine] Attempt ${attempt + 1}/${maxRetries + 1} failed, ` +
                        `retrying in ${delayMs}ms...`
                    );
                    await this.delay(delayMs);
                }
            }
        }

        throw lastError;
    }

    /**
     * Utility delay function
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get the current status of the engine
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            cycleIntervalMs: this.cycleIntervalMs,
            nextCycleIn: this.intervalId ? this.cycleIntervalMs : null
        };
    }

    /**
     * Force run a cycle immediately (useful for testing)
     */
    async forceCycle() {
        console.log('[Automation Engine] Force running cycle...');
        await this.runCycle();
    }
}

// Singleton instance
export const automationEngine = new WorkflowAutomationEngine();

// Export for convenience
export default automationEngine;
