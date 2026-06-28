
import { supabase } from '../src/lib/supabase';
import { workflowService } from '../src/services/workflowService';
import { surveyService } from '../src/services/surveyService';
import crypto from 'crypto';

async function verifyCampaignExecution() {
    console.log('Starting Campaign Execution Verification...');

    // 1. Authenticate as Admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@hospital.com',
        password: 'admin123'
    });

    if (authError || !authData.user) {
        console.error('Failed to sign in as admin:', authError);
        return;
    }
    console.log('Signed in as Admin');

    // 2. Create Test Patient
    const suffix = Math.floor(Math.random() * 100000);
    const email = `campaign.test.${suffix}@hospital.com`;
    const password = 'testpassword123';

    // Sign up patient
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: 'Campaign',
                last_name: `User${suffix}`,
                role: 'patient'
            }
        }
    });

    if (signUpError || !signUpData.user) {
        console.error('Failed to sign up test patient:', signUpError);
        return;
    }
    const patientId = signUpData.user.id;
    console.log('Created Patient:', patientId);

    // Re-login as Admin
    await supabase.auth.signInWithPassword({
        email: 'admin@hospital.com',
        password: 'admin123'
    });

    // Create Patient Record
    const { error: patientRecError } = await supabase
        .from('patients')
        .insert([{
            id: patientId,
            first_name: 'Campaign',
            last_name: `User${suffix}`,
            email: email,
            contact_number: '555-0000'
        }]);

    if (patientRecError) {
        console.error('Failed to create patient record:', patientRecError);
        return;
    }

    // 3. Create Survey Template
    const templateId = crypto.randomUUID();
    const { error: tmplError } = await supabase
        .from('survey_templates')
        .insert([{
            id: templateId,
            name: 'Campaign Test Survey',
            description: 'Test Survey',
            category: 'general',
            is_active: true,
            questions: []
        }]);

    if (tmplError) {
        console.error('Failed to create survey template:', tmplError);
        return;
    }

    // 4. Create Workflow Template
    const wfTmplId = crypto.randomUUID();
    const { error: wfError } = await supabase
        .from('workflow_templates')
        .insert([{
            id: wfTmplId,
            name: 'Test Campaign Workflow',
            description: 'Test Flow',
            category: 'onboarding',
            is_active: true,
            trigger_type: 'manual',
            trigger_event: 'manual_start'
        }]);

    if (wfError) {
        console.error('Failed to create workflow template:', wfError);
        return;
    }

    // 5. Add Steps: 1. Send Message, 2. Send Survey
    await workflowService.addStep({
        workflow_id: wfTmplId,
        step_order: 1,
        step_name: 'Welcome Email',
        step_type: 'send_message',
        action_type: 'automated',
        action_config: {
            channel: 'email',
            subject: 'Welcome to Campaign',
            message: 'Welcome!'
        }
    });

    await workflowService.addStep({
        workflow_id: wfTmplId,
        step_order: 2,
        step_name: 'Initial Survey',
        step_type: 'send_survey',
        action_type: 'automated',
        action_config: {
            channel: 'email',
            survey_template_id: templateId
        }
    });

    // 6. Start Workflow
    console.log('Starting Workflow...');
    const instance = await workflowService.startWorkflow(wfTmplId, patientId, 'manual_start');
    console.log('Workflow Instance Started:', instance.id);

    // 7. Run Automation Cycle (Process Step 1)
    console.log('Running Cycle 1 (Message)...');
    await workflowService.runAutomationCycle();

    // 8. Run Automation Cycle (Process Step 2)
    // Step 1 finishes and moves to Step 2 immediately if no delay?
    // moveToNextStep sets nextExecutionAt to now.
    console.log('Running Cycle 2 (Survey)...');
    await workflowService.runAutomationCycle();

    console.log('✅ Campaign Execution Verify Complete');
}

verifyCampaignExecution();
