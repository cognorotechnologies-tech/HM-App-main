import api from '../lib/api';

// Stubbed taskService to remove Supabase dependencies


// Helper type for Staff Task
export interface StaffTask {
    id: string;
    patient_id: string;
    workflow_instance_id?: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    assigned_role: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    due_date?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
    // Joined fields
    patient?: {
        first_name: string;
        last_name: string;
    };
    is_recurring?: boolean;
    recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'custom';
    recurrence_interval?: number;
    recurrence_end_date?: string;
    recurrence_days?: string[];
}

export interface TaskStats {
    total: number;
    pending: number;
    completed: number;
    highPriority?: number;
}

interface TaskFilters {
    status?: string;
    priority?: string;
    assigned_role?: string;
    patient_id?: string;
    workflow_instance_id?: string;
    [key: string]: string | undefined;
}

export const taskService = {
    async getTasks(filters?: TaskFilters) {
        let queryString = '';
        if (filters) {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) params.append(key, filters[key] as string);
            });
            queryString = `?${params.toString()}`;
        }
        const response = await api.get(`/tasks${queryString}`);
        return response.data;
    },

    async getTaskById(taskId: string) {
        const response = await api.get(`/tasks/${taskId}`);
        return response.data as StaffTask;
    },

    async completeTask(taskId: string) {
        return this.update(taskId, { status: 'completed' });
    },

    async list(filters?: TaskFilters): Promise<StaffTask[]> {
        return this.getTasks(filters);
    },

    async getStats(): Promise<TaskStats> {
        const response = await api.get('/tasks/stats');
        return response.data;
    },

    async create(task: Partial<StaffTask>) {
        const response = await api.post('/tasks', task);
        return response.data;
    },

    async update(taskId: string, updates: Partial<StaffTask>) {
        const response = await api.put(`/tasks/${taskId}`, updates);
        return response.data;
    },

    async delete(taskId: string) {
        await api.delete(`/tasks/${taskId}`);
    }
};
