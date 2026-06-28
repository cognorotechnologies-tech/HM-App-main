import api from '../lib/axios';

export interface Schedule {
    id: string;
    doctor_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration: number;
}

export const scheduleService = {
    async getByDoctor(doctorId: string) {
        const { data } = await api.get<Schedule[]>('/schedules', {
            params: { doctor_id: doctorId }
        });
        return data;
    },

    async create(schedule: {
        doctor_id: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
        slot_duration: number;
    }) {
        const { data } = await api.post<Schedule>('/schedules', schedule);
        return data;
    },

    async delete(id: string) {
        await api.delete(`/schedules/${id}`);
    }
};
