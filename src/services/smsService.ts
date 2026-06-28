// SMS Service using Twilio API
// Note: Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER environment variables

interface SMSOptions {
    to: string;
    message: string;
}

class SMSService {
    private accountSid: string | undefined;
    private authToken: string | undefined;
    private fromPhone: string | undefined;

    constructor() {
        // In production, these should come from environment variables
        this.accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
        this.authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
        this.fromPhone = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
    }

    async sendSMS(options: SMSOptions): Promise<{ success: boolean; id?: string; error?: string }> {
        if (!this.accountSid || !this.authToken || !this.fromPhone) {
            console.warn('Twilio credentials not configured');
            return {
                success: false,
                error: 'SMS service not configured. Please add Twilio credentials to environment variables.'
            };
        }

        try {
            // Create basic auth header
            const credentials = btoa(`${this.accountSid}:${this.authToken}`);

            const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        To: options.to,
                        From: this.fromPhone,
                        Body: options.message,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error('Twilio API error:', data);
                return {
                    success: false,
                    error: data.message || 'Failed to send SMS'
                };
            }

            return {
                success: true,
                id: data.sid
            };
        } catch (error) {
            console.error('SMS send error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async sendBulkSMS(messages: SMSOptions[]): Promise<{
        sent: number;
        failed: number;
        results: Array<{ phone: string; success: boolean; id?: string; error?: string }>;
    }> {
        const results = [];
        let sent = 0;
        let failed = 0;

        // Send SMS in batches to avoid rate limiting
        const batchSize = 5;
        for (let i = 0; i < messages.length; i += batchSize) {
            const batch = messages.slice(i, i + batchSize);

            const batchResults = await Promise.all(
                batch.map(async (sms) => {
                    const result = await this.sendSMS(sms);
                    if (result.success) {
                        sent++;
                    } else {
                        failed++;
                    }
                    return {
                        phone: sms.to,
                        ...result
                    };
                })
            );

            results.push(...batchResults);

            // Delay between batches
            if (i + batchSize < messages.length) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

        return { sent, failed, results };
    }

    // Validate phone number format
    validatePhoneNumber(phone: string): boolean {
        // Basic E.164 format validation (international format)
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        return e164Regex.test(phone);
    }

    // Format phone number to E.164
    formatPhoneNumber(phone: string, defaultCountryCode: string = '+1'): string {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');

        // If it doesn't start with a country code, add default
        if (!phone.startsWith('+')) {
            cleaned = defaultCountryCode.replace('+', '') + cleaned;
        }

        return '+' + cleaned;
    }

    // Calculate SMS character count and segments
    getSMSInfo(message: string): {
        characters: number;
        segments: number;
        encoding: 'GSM-7' | 'UCS-2';
    } {
        // Check if message contains non-GSM characters
        const gsmRegex = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-Z\u00C4\u00D6\u00D1\u00DCa-z\u00E4\u00F6\u00F1\u00FC\u00E0\u20AC]*$/;
        const isGSM = gsmRegex.test(message);

        const encoding = isGSM ? 'GSM-7' : 'UCS-2';
        const maxLength = isGSM ? 160 : 70;
        const maxConcatLength = isGSM ? 153 : 67;

        const characters = message.length;
        let segments = 1;

        if (characters > maxLength) {
            segments = Math.ceil(characters / maxConcatLength);
        }

        return { characters, segments, encoding };
    }
}

export const smsService = new SMSService();
