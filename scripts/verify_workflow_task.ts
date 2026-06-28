
import { supabase } from '../src/lib/supabase';
import { workflowService } from '../src/services/workflowService';
import { taskService } from '../src/services/taskService';

async function main() {
    console.log('Starting verification of Create Staff Task workflow...');

    // 0. Login as admin
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@hospital.com',
        password: 'admin123'
    });

    if (authError) {
        console.error('Failed to login:', authError);
        process.exit(1);
    }
    console.log('✅ Logged in as admin');

    const patientSuffix = Math.floor(Math.random() * 10000);

    // 1. Create an auth user for the patient
    const email = `test${patientSuffix}@example.com`;
    // Note: admin.createUser might need service role key if regular admin can't do it, 
    // but here we are logged in as an app admin which hopefully has permissions via RLS or is utilizing the client correctly.
    // If this fails, we might need a different approach, but let's try.
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { role: 'patient' }
    });

    if (userError || !user || !user.user) {
        console.error('Failed to create auth user:', userError);
        process.exit(1);
    }
    console.log('✅ Created auth user:', user.user.id);

    // 2. Create a dummy patient linked to the user
    // We cast to any because the generated types might mismatch with our manual extensions or just for ease here
    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert([{
            user_id: user.user.id,
            first_name: 'Test',
            last_name: `Patient${patientSuffix}`,
            date_of_birth: '1990-01-01',
            gender: 'other',
            contact_number: '555-0100',
            email: email
        }] as any)
        .select()
        .single();

    if (patientError || !patient) {
        console.error('Failed to create patient:', patientError);
        process.exit(1);
    }
    console.log('✅ Created patient:', patient.id);

    try {
        // 3. Create a workflow template
        const { data: template, error: templateError } = await workflowService.createTemplate({
            name: `Test Workflow ${patientSuffix}`,
            description: 'Testing task creation',
            category: 'general',
            is_active: true,
            version: 1,
            trigger_type: 'manual',
            trigger_config: {},
            total_executions: 0,
            successful_executions: 0
        });

        if (templateError || !template) {
            throw new Error('Failed to create template: ' + JSON.stringify(templateError));
        }
        console.log('✅ Created template:', template.id);

        // Add step
        await workflowService.addStep({
            workflow_id: template.id,
            step_name: 'Create Staff Task Step',
            step_order: 1,
            step_type: 'create_task',
            is_condition: false,
            action_type: 'task',
            delay_days: 0,
            delay_hours: 0,
            action_config: {
                task_title: `Follow up with Test Patient ${patientSuffix}`,
                assigned_role: 'nurse',
                priority: 'high',
                task_description: 'Verify this task exists'
            }
        });
        console.log('✅ Added create_task step');

        // 4. Start workflow instance
        const instance = await workflowService.startWorkflow(
            template.id,
            patient.id,
            'manual_test'
        );

        if (!instance) {
            throw new Error('Failed to start workflow instance');
        }
        console.log('✅ Started workflow instance:', instance.id);

        // 5. Run automation cycle
        console.log('🔄 Running automation cycle...');
        const result = await workflowService.runAutomationCycle();
        console.log('Automation result:', result);

        // 6. Verify task creation
        const tasks = await taskService.getTasks();
        const createdTask = tasks.find(t =>
            t.workflow_instance_id === instance.id &&
            t.title === `Follow up with Test Patient ${patientSuffix}`
        );

        if (createdTask) {
            console.log('✅ VERIFICATION SUCCESS: Task found!');
            // We use 'any' cast to access patient because TS might not know about the joined field property if types aren't updated
            const taskWithPatient = createdTask as any;

            console.log('Task Details:', {
                id: createdTask.id,
                title: createdTask.title,
                patientName: taskWithPatient.patient ? `${taskWithPatient.patient.first_name} ${taskWithPatient.patient.last_name}` : 'MISSING PATIENT DATA'
            });

            if (!taskWithPatient.patient) {
                console.error('❌ FAILURE: Patient data is missing in the task response!');
                process.exit(1);
            }
        } else {
            console.error('❌ FAILURE: Task was not created.');
            process.exit(1);
        }

    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    } finally {
        // Cleanup
        // console.log('Cleaning up...');
        // await supabase.from('patients').delete().eq('id', patient.id);
        // Cascading deletes should handle the rest
    }
}

main();
