// Email Service using Resend API
// Note: Requires RESEND_API_KEY environment variable

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

class EmailService {
    private apiKey: string | undefined;
    private fromEmail: string;
    private isMockMode: boolean;

    constructor() {
        // In production, this should come from environment variables
        this.apiKey = import.meta.env.VITE_RESEND_API_KEY;
        this.fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@hospital.com';
        this.isMockMode = import.meta.env.VITE_MOCK_EMAIL_MODE === 'true';
    }

    async sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
        if (this.isMockMode) {
            console.log('📧 [MOCK EMAIL SERVICE] Sending email:', {
                to: options.to,
                subject: options.subject,
                from: options.from || this.fromEmail,
                // Truncate HTML for clean logs
                htmlPreview: options.html.substring(0, 100) + '...'
            });
            return {
                success: true,
                id: 'mock-email-' + crypto.randomUUID()
            };
        }

        if (!this.apiKey) {
            console.warn('Resend API key not configured');
            return {
                success: false,
                error: 'Email service not configured. Please add VITE_RESEND_API_KEY to environment variables.'
            };
        }

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: options.from || this.fromEmail,
                    to: [options.to],
                    subject: options.subject,
                    html: options.html,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Resend API error:', data);
                return {
                    success: false,
                    error: data.message || 'Failed to send email'
                };
            }

            return {
                success: true,
                id: data.id
            };
        } catch (error) {
            console.error('Email send error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async sendBulkEmails(emails: EmailOptions[]): Promise<{
        sent: number;
        failed: number;
        results: Array<{ email: string; success: boolean; id?: string; error?: string }>;
    }> {
        const results = [];
        let sent = 0;
        let failed = 0;

        // Send emails in batches to avoid rate limiting
        const batchSize = 10;
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);

            const batchResults = await Promise.all(
                batch.map(async (email) => {
                    const result = await this.sendEmail(email);
                    if (result.success) {
                        sent++;
                    } else {
                        failed++;
                    }
                    return {
                        email: email.to,
                        ...result
                    };
                })
            );

            results.push(...batchResults);

            // Small delay between batches to avoid rate limiting
            if (i + batchSize < emails.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return { sent, failed, results };
    }

    // Generate tracking pixel for open tracking
    getTrackingPixel(campaignId: string, recipientId: string): string {
        // Points to a pixel tracking endpoint. 
        // In a real app, this would be a backend endpoint returning a 1x1 gif.
        // For this demo, we can point to a tracking route that logs on frontend load (if email client allows js? No.)
        // So standard way: <img src="API_URL/track/open?..." />
        // We'll simulate this by returning a specialized URL. 
        // Since we don't have a backend, we'll use a placeholder service that echoes back, or just a known string.
        const trackingUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/track/open?cid=${campaignId}&pid=${recipientId}`;
        return `<img src="${trackingUrl}" width="1" height="1" alt="" style="display:none;" />`;
    }

    // Wrap links with tracking URLs
    wrapLinksWithTracking(html: string, campaignId: string, recipientId: string): string {
        const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
        const trackingBase = `${appUrl}/track/click?cid=${campaignId}&pid=${recipientId}&url=`;

        // Regex to replace href="..."
        return html.replace(
            /href="([^"]*)"/g,
            (match, url) => {
                // Don't wrap anchor links or existing tracking links
                if (url.startsWith('#') || url.includes('/track/')) return match;
                return `href="${trackingBase}${encodeURIComponent(url)}"`;
            }
        );
    }

    // Add tracking to email HTML
    addTracking(html: string, campaignId: string, recipientId: string): string {
        let trackedHtml = this.wrapLinksWithTracking(html, campaignId, recipientId);
        trackedHtml += this.getTrackingPixel(campaignId, recipientId);
        return trackedHtml;
    }
}

export const emailService = new EmailService();
