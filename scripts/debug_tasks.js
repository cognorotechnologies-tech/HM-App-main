import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking Workflows and Tasks...');

    // 1. Check recent workflow instances
    const { data: instances, error: instanceError } = await supabase
        .from('workflow_instances')
        .select('*, workflow_step_executions(*)')
        .order('created_at', { ascending: false })
        .limit(5);

    if (instanceError) console.error('Error fetching instances:', instanceError);
    console.log('Recent Workflow Instances:', JSON.stringify(instances, null, 2));

    // 2. Check staff tasks
    const { data: tasks, error: taskError } = await supabase
        .from('staff_tasks')
        .select('*')
        .order('created_at', { ascending: false });

    if (taskError) console.error('Error fetching tasks:', taskError);
    console.log('All Staff Tasks:', JSON.stringify(tasks, null, 2));
}

checkData();
