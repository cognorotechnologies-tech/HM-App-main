// Example: How to use WhatsApp Service in Campaigns and Workflows

import { whatsappService } from '../services/whatsappService';

/**
 * EXAMPLE 1: Send Appointment Reminder via WhatsApp
 * Use this in workflow automation or campaign sending
 */
export async function sendAppointmentReminder(appointmentData: {
    patientPhone: string;
    patientName: string;
    patientId: string;
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
    clinicAddress: string;
}) {
    const result = await whatsappService.sendMessage({
        to: appointmentData.patientPhone,
        templateId: 'appointment_reminder_1', // Use template name from database
        templateVariables: {
            patient_name: appointmentData.patientName,
            doctor_name: appointmentData.doctorName,
            appointment_date: appointmentData.appointmentDate,
            appointment_time: appointmentData.appointmentTime,
            clinic_address: appointmentData.clinicAddress
        },
        patientId: appointmentData.patientId
    });

    if (result.success) {
        console.log('✅ WhatsApp reminder sent:', result.messageId);
    } else {
        console.error('❌ Failed to send:', result.error);
    }

    return result;
}

/**
 * EXAMPLE 2: Send Bulk Campaign via WhatsApp
 * Use this in Campaign execution
 */
export async function sendWhatsAppCampaign(
    campaignId: string,
    recipients: Array<{ phone: string; name: string; patientId?: string }>,
    templateId: string
) {
    const result = await whatsappService.sendBulkMessages(
        recipients.map(r => ({ phone: r.phone, patientId: r.patientId })),
        {
            templateId,
            campaignId,
            templateVariables: {} // Map patient-specific variables
        }
    );

    console.log(`📊 Campaign Results:
        ✅ Sent: ${result.sent}
        ❌ Failed: ${result.failed}
        Total: ${recipients.length}
    `);

    return result;
}

/**
 * EXAMPLE 3: Workflow Action - Post-Surgery Follow-up
 * This would be triggered 3 days after surgery
 */
export async function sendPostSurgeryFollowUp(workflowData: {
    patientPhone: string;
    patientId: string;
    patientName: string;
    surgeryDate: string;
    doctorName: string;
    workflowActionId: string;
}) {
    const result = await whatsappService.sendMessage({
        to: workflowData.patientPhone,
        templateId: 'follow_up_care_1',
        templateVariables: {
            patient_name: workflowData.patientName,
            visit_date: workflowData.surgeryDate,
            doctor_name: workflowData.doctorName
        },
        patientId: workflowData.patientId,
        workflowActionId: workflowData.workflowActionId
    });

    return result;
}

/**
 * EXAMPLE 4: Medication Reminder
 * Can be scheduled in workflows
 */
export async function sendMedicationReminder(medicationData: {
    patientPhone: string;
    patientId: string;
    patientName: string;
    medicationName: string;
    dosage: string;
}) {
    const result = await whatsappService.sendMessage({
        to: medicationData.patientPhone,
        templateId: 'medication_reminder_1',
        templateVariables: {
            patient_name: medicationData.patientName,
            medication_name: medicationData.medicationName,
            dosage: medicationData.dosage
        },
        patientId: medicationData.patientId
    });

    return result;
}

/**
 * EXAMPLE 5: Integration in Campaign Component
 * Add this to CampaignList or CreateCampaign components
 */
export async function executeCampaignWithWhatsApp(campaign: {
    id: string;
    name: string;
    channel: 'email' | 'sms' | 'whatsapp' | 'both';
    recipients: any[];
}) {
    if (campaign.channel === 'whatsapp' || campaign.channel === 'both') {
        // Get WhatsApp template
        const templates = await whatsappService.getTemplates();

        // Filter recipients with valid phone numbers
        const whatsappRecipients = campaign.recipients.filter(r =>
            whatsappService.validatePhoneNumber(r.phone)
        );

        // Send bulk messages
        const result = await whatsappService.sendBulkMessages(
            whatsappRecipients,
            {
                templateId: templates[0]?.id, // Select appropriate template
                campaignId: campaign.id
            }
        );

        return result;
    }
}

/**
 * EXAMPLE 6: Get Message Statistics for Dashboard
 */
export async function getWhatsAppDashboardStats() {
    const stats = await whatsappService.getMessageStats();

    return {
        totalMessages: stats.total,
        deliveryRate: ((stats.delivered / stats.total) * 100).toFixed(1) + '%',
        readRate: ((stats.read / stats.total) * 100).toFixed(1) + '%',
        failureRate: ((stats.failed / stats.total) * 100).toFixed(1) + '%',
        pending: stats.pending
    };
}

/**
 * HOW TO INTEGRATE IN WORKFLOW BUILDER
 * 
 * 1. In WorkflowBuilder.tsx, add new action type:
 * 
 * const actionTypes = [
 *   { value: 'send_email', label: 'Send Email' },
 *   { value: 'send_sms', label: 'Send SMS' },
 *   { value: 'send_whatsapp', label: 'Send WhatsApp' }, // NEW
 *   { value: 'create_task', label: 'Create Staff Task' }
 * ];
 * 
 * 2. When action_type === 'send_whatsapp', show template selector:
 * 
 * {actionType === 'send_whatsapp' && (
 *   <div>
 *     <label>WhatsApp Template</label>
 *     <select onChange={(e) => setSelectedTemplate(e.target.value)}>
 *       {templates.map(t => (
 *         <option key={t.id} value={t.id}>{t.name}</option>
 *       ))}
 *     </select>
 *   </div>
 * )}
 * 
 * 3. Execute action in workflow runner:
 * 
 * if (action.type === 'send_whatsapp') {
 *   await whatsappService.sendMessage({
 *     to: patient.phone,
 *     templateId: action.config.templateId,
 *     templateVariables: action.config.variables,
 *     patientId: patient.id,
 *     workflowActionId: action.id
 *   });
 * }
 */

/**
 * HOW TO ADD TO CAMPAIGN UI
 * 
 * 1. In CampaignList.tsx, update channel filter to include WhatsApp:
 * 
 * const channelOptions = [
 *   { value: 'all', label: 'All Channels' },
 *   { value: 'email', label: 'Email' },
 *   { value: 'sms', label: 'SMS' },
 *   { value: 'whatsapp', label: 'WhatsApp' }, // NEW
 *   { value: 'both', label: 'Email + SMS' }
 * ];
 * 
 * 2. Add WhatsApp icon in campaign display:
 * 
 * {campaign.channel === 'whatsapp' && <MessageSquare className="w-5 h-5 text-green-600" />}
 * 
 * 3. When creating campaign, add template selection for WhatsApp
 */
