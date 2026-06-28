import { supabase } from '../src/lib/supabase';
import { surveyService } from '../src/services/surveyService';

async function verifyNurseDashboard() {
    console.log('Starting Nurse Dashboard Verification...');

    try {
        // Authenticate as Admin
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'admin@hospital.com',
            password: 'admin123'
        });

        if (authError || !authData.user) {
            console.error('Failed to sign in as admin:', authError);
            return;
        }
        console.log('Signed in as Admin:', authData.user.id);

        // 1. Create a dummy patient
        // We need a corresponding profile first due to FK constraint.
        // We'll create a new auth user which triggers profile creation.
        const suffix = Math.floor(Math.random() * 100000);
        const email = `patient.test.${suffix}@hospital.com`;
        const password = 'testpassword123';

        // Sign up a new user to get an ID/Profile
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: 'Alert',
                    last_name: `Patient${suffix}`,
                    role: 'patient'
                }
            }
        });

        if (signUpError || !signUpData.user) {
            console.error('Failed to sign up test patient user:', signUpError);
            return;
        }

        const patientId = signUpData.user.id;
        console.log('Created Auth User/Profile:', patientId);

        // Now insert into patients table using this ID
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .insert([{
                id: patientId,
                first_name: 'Alert',
                last_name: `Patient${suffix}`,
                date_of_birth: '1980-01-01',
                contact_number: '555-9999',
                email: email,
                gender: 'other',
                address_street: '123 Alert Ln'
            }])
            .select()
            .single();

        if (patientError) {
            console.error('Failed to create patient:', patientError);
            return;
        }
        console.log('Created Test Patient:', patient.id);

        // Re-authenticate as Admin to create templates/instances/alerts (Patient role can't do this)
        console.log('Re-authenticating as Admin...');
        await supabase.auth.signInWithPassword({
            email: 'admin@hospital.com',
            password: 'admin123'
        });

        // 2. Create a dummy survey alert
        const templateId = crypto.randomUUID();
        const { data: template, error: templateError } = await supabase
            .from('survey_templates')
            .insert([{
                id: templateId,
                name: 'Test Alert Template',
                description: 'Test',
                category: 'general',
                is_active: true,
                questions: []
            }])
            .select()
            .single();

        if (templateError) {
            console.error('Failed to create template:', templateError);
            return;
        }

        const instanceId = crypto.randomUUID();
        const { data: instance, error: instanceError } = await supabase
            .from('survey_instances')
            .insert([{
                id: instanceId,
                survey_template_id: template.id,
                patient_id: patient.id,
                status: 'completed',
                sent_via: 'email',
                sent_to: 'test',
                access_token: 'test-token-' + Date.now()
            }])
            .select()
            .single();

        if (instanceError) {
            console.error('Failed to create instance:', instanceError);
            return;
        }

        console.log('Created Survey Instance:', instance.id);

        await surveyService.createAlert({
            survey_instance_id: instance.id,
            patient_id: patient.id,
            alert_type: 'critical',
            severity: 5,
            category: 'pain',
            title: 'Test Critical Alert',
            alert_reason: 'High pain score reported',
            status: 'open',
            triggered_by: { question: 'pain_level', answer: 10 }
        });

        console.log('Created Alert manually.');

        // Re-authenticate as Admin to view alerts (since signUp switched session to patient)
        console.log('Re-authenticating as Admin...');
        await supabase.auth.signInWithPassword({
            email: 'admin@hospital.com',
            password: 'admin123'
        });

        // 3. Fetch alerts using the updated service
        console.log('Fetching alerts via surveyService...');
        const alerts = await surveyService.getAlerts({ limit: 5 });

        // 4. Verify the fetched alert has the correct patient name
        const TestAlert = alerts.find((a: any) => a.patient_id === patient.id);

        if (TestAlert) {
            console.log('found alert:', TestAlert.id);
            console.log('Attached Patient Data:', TestAlert.patients);

            if (TestAlert.patients.first_name === 'Alert' && TestAlert.patients.phone === '555-9999') {
                console.log('✅ SUCCESS: Patient data correctly mapped from patients table!');
            } else {
                console.error('❌ FAILURE: Patient data mismatch.', TestAlert.patients);
            }
        } else {
            console.error('❌ FAILURE: Could not find the created alert in the fetch results.');
        }

    } catch (err) {
        console.error('Verification failed with error:', err);
    }
}

verifyNurseDashboard();
