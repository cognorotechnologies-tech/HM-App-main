import api from '../lib/axios';

export type MetricType = 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'weight' | 'height' | 'temperature' | 'spo2';

export interface HealthMetric {
    id: string;
    patient_id: string;
    metric_type: string;
    value: any;
    unit: string;
    recorded_at: string;
    notes: string | null;
    recorded_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface NewHealthMetric {
    patient_id: string;
    metric_type: string;
    value: any;
    unit: string;
    recorded_at?: string;
    notes?: string;
    recorded_by?: string;
}

export const healthMetricsService = {
    async getAll(filters?: { patient_id?: string; metric_type?: string }) {
        const { data } = await api.get<HealthMetric[]>('/health-metrics', { params: filters });
        return data;
    },

    async getById(id: string) {
        const { data } = await api.get<HealthMetric>(`/health-metrics/${id}`);
        return data;
    },

    async getByPatient(patientId: string) {
        const { data } = await api.get<HealthMetric[]>('/health-metrics/by-patient', {
            params: { patient_id: patientId }
        });
        return data;
    },

    async create(metric: NewHealthMetric) {
        const { data } = await api.post<HealthMetric>('/health-metrics', metric);
        return data;
    },

    async update(id: string, updates: Partial<{
        value: number;
        unit: string;
        notes: string;
        recorded_at: string;
    }>) {
        const { data } = await api.put<HealthMetric>(`/health-metrics/${id}`, updates);
        return data;
    },

    async delete(id: string) {
        await api.delete(`/health-metrics/${id}`);
    },

    async getLatestByType(patientId: string, metricType: string) {
        const { data } = await api.get<HealthMetric>('/health-metrics/latest', {
            params: { patient_id: patientId, metric_type: metricType }
        });
        return data;
    },

    async getHistory(patientId: string, metricType: string, limit: number = 10) {
        const { data } = await api.get<HealthMetric[]>('/health-metrics/history', {
            params: { patient_id: patientId, metric_type: metricType, limit }
        });
        return data;
    },

    // Alias for create - backwards compatibility
    async record(metric: NewHealthMetric) {
        return this.create(metric);
    },

    // Placeholder for trends - to be implemented in backend
    async getTrends(patientId: string, metricType: string, days: number = 30) {
        // Use history as trends for now
        return this.getHistory(patientId, metricType, days);
    },

    // Placeholder for stats - to be implemented in backend
    async getStats(patientId: string, metricType: string, days: number = 30) {
        const history = await this.getHistory(patientId, metricType, days);
        if (history.length === 0) {
            return { average: 0, min: 0, max: 0, count: 0 };
        }
        const values = history.map(h => h.value);
        return {
            average: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length
        };
    }
};
