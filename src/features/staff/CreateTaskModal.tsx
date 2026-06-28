
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, Repeat } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { taskService } from '../../services/taskService';
import { useToast } from '../../hooks/useToast';

const createTaskSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().optional(),
    assigned_role: z.string().min(1, 'Role is required'),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    due_date: z.string().optional(),
    is_recurring: z.boolean().optional(),
    recurrence_pattern: z.enum(['daily', 'weekly', 'monthly', 'custom']).optional(),
    recurrence_interval: z.coerce.number().min(1).optional(),
    recurrence_end_date: z.string().optional(),
    recurrence_days: z.array(z.string()).optional()
});

interface CreateTaskModalProps {
    task?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateTaskModal({ task, onClose, onSuccess }: CreateTaskModalProps) {
    const toast = useToast();
    // Safely handle recurrence_days parsing
    const safeRecurrenceDays = (() => {
        if (!task?.recurrence_days) return [];
        if (Array.isArray(task.recurrence_days)) return task.recurrence_days;
        try {
            return typeof task.recurrence_days === 'string' ? JSON.parse(task.recurrence_days) : [];
        } catch {
            return [];
        }
    })();

    const [isRecurring, setIsRecurring] = useState(task?.is_recurring || false);

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            title: task?.title || '',
            description: task?.description || '',
            priority: task?.priority || 'medium',
            assigned_role: task?.assigned_role || 'nurse',
            due_date: task?.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
            is_recurring: task?.is_recurring || false,
            recurrence_pattern: task?.recurrence_pattern || 'daily',
            recurrence_interval: task?.recurrence_interval || 1,
            recurrence_days: safeRecurrenceDays,
            recurrence_end_date: task?.recurrence_end_date ? new Date(task.recurrence_end_date).toISOString().slice(0, 10) : ''
        }
    });

    const watchedPattern = watch('recurrence_pattern');

    const onSubmit = async (data: any) => {
        try {
            // Clean up recurrence data if not recurring
            if (!data.is_recurring) {
                delete data.recurrence_pattern;
                delete data.recurrence_interval;
                delete data.recurrence_end_date;
                delete data.recurrence_days;
            }

            if (task) {
                await taskService.update(task.id, data);
                toast.success('Task updated successfully');
            } else {
                await taskService.create(data);
                toast.success('Task created successfully');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error(task ? 'Failed to update task' : 'Failed to create task');
        }
    };

    const toggleDay = (day: string) => {
        const current = watch('recurrence_days') || [];
        const newDays = current.includes(day)
            ? current.filter((d: string) => d !== day)
            : [...current, day];
        setValue('recurrence_days', newDays);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">{task ? 'Edit Task' : 'Create New Task'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <Input
                        label="Task Title"
                        {...register('title')}
                        error={errors.title?.message}
                        placeholder="e.g. Morning Vitals Check"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                            rows={3}
                            placeholder="Add details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Role</label>
                            <select {...register('assigned_role')} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5">
                                <option value="nurse">Nurse</option>
                                <option value="doctor">Doctor</option>
                                <option value="receptionist">Receptionist</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select {...register('priority')} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Due Date"
                        type="datetime-local"
                        {...register('due_date')}
                    />

                    {/* Recurrence Section */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Repeat className="w-4 h-4 text-teal-600" />
                                <span className="font-medium text-gray-900">Recurring Task</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isRecurring}
                                    onChange={(e) => {
                                        setIsRecurring(e.target.checked);
                                        setValue('is_recurring', e.target.checked);
                                    }}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>

                        {isRecurring && (
                            <div className="space-y-4 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Pattern</label>
                                        <select {...register('recurrence_pattern')} className="w-full rounded-md border-gray-300 text-sm">
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Every (Interval)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                {...register('recurrence_interval')}
                                                className="w-full rounded-md border-gray-300 text-sm"
                                            />
                                            <span className="text-sm text-gray-500">
                                                {watchedPattern === 'daily' ? 'days' : watchedPattern === 'weekly' ? 'weeks' : 'months'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {watchedPattern === 'weekly' && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-2">Repeat on</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${(watch('recurrence_days') || []).includes(day)
                                                            ? 'bg-teal-600 text-white shadow-sm'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {day[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        {...register('recurrence_end_date')}
                                        className="w-full rounded-md border-gray-300 text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>{task ? 'Update Task' : 'Create Task'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
