
import { useState, useEffect } from 'react';
import {
    CheckCircle, Clock, AlertTriangle, Search, Filter,
    Calendar, CheckSquare, MoreVertical, ListTodo, Plus, Edit, Trash2
} from 'lucide-react';
import { taskService, type StaffTask } from '../../services/taskService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';
import { CreateTaskModal } from './CreateTaskModal';

export default function StaffTaskList() {
    const toast = useToast();
    const [tasks, setTasks] = useState<StaffTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, highPriority: 0 });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<StaffTask | null>(null);

    useEffect(() => {
        loadTasks();
    }, [statusFilter]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (statusFilter !== 'all') filters.status = statusFilter;

            const [tasksData, statsData] = await Promise.all([
                taskService.getTasks(filters),
                taskService.getStats()
            ]);

            setTasks(tasksData || []);
            if (statsData) setStats({
                ...statsData,
                highPriority: statsData.highPriority || 0
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            await taskService.completeTask(taskId);
            toast.success('Task marked as complete');
            loadTasks();
        } catch (error) {
            toast.error('Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await taskService.delete(taskId);
            toast.success('Task deleted successfully');
            loadTasks();
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-900 bg-red-100 border-red-200';
            case 'high': return 'text-orange-800 bg-orange-100 border-orange-200';
            case 'medium': return 'text-blue-800 bg-blue-100 border-blue-200';
            default: return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    const filteredTasks = tasks.filter(task => {
        const lowerQuery = searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(lowerQuery);
        const firstNameMatch = task.patient?.first_name?.toLowerCase().includes(lowerQuery) || false;
        const lastNameMatch = task.patient?.last_name?.toLowerCase().includes(lowerQuery) || false;
        return titleMatch || firstNameMatch || lastNameMatch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff Tasks</h1>
                    <p className="text-gray-500 mt-1">Manage generated tasks and schedules</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadTasks}>
                        Refresh
                    </Button>
                    <Button onClick={() => {
                        setEditingTask(null);
                        setIsCreateModalOpen(true);
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Create Task
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 text-sm">Pending Tasks</span>
                        <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 text-sm">High Priority</span>
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 text-sm">Completed Today</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 text-sm">Total Tasks</span>
                        <ListTodo className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search tasks by title or patient name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Task List */}
            {loading ? (
                <div className="flex justify-center py12">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-200 border-t-teal-600"></div>
                    <p className="mt-4 text-gray-500 text-sm">Loading tasks...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-dashed border-teal-200">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckSquare className="w-10 h-10 text-teal-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        {searchQuery ? `No tasks matching "${searchQuery}"` : 'All caught up! No pending tasks matching your criteria.'}
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4">
                        Create Your First Task
                    </Button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-teal-50 to-cyan-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Task Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredTasks.map((task) => (
                                <tr key={task.id} className="hover:bg-teal-50/50 transition-all duration-200 group">
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2 ${task.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                            task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                                            {task.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md ring-2 ring-teal-100 group-hover:ring-teal-200 transition-all ${getPriorityColor(task.priority).replace('text-', 'bg-').replace('bg-', 'bg-gradient-to-br from-').replace('-800', '-500').replace('-900', '-500').replace('-700', '-500').replace('-100', '-500')}`}>
                                                {task.priority === 'critical' ? '!' : task.priority === 'high' ? '↑' : task.priority === 'medium' ? '=' : '↓'}
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">{task.title}</span>
                                                {task.description && (
                                                    <span className="block text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</span>
                                                )}
                                                {task.is_recurring && (
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-teal-600 bg-teal-50 w-fit px-1.5 py-0.5 rounded">
                                                        <Clock size={10} />
                                                        <span>Repeats {task.recurrence_pattern}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {task.patient ? (
                                            <>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {task.patient.first_name} {task.patient.last_name}
                                                </div>
                                                <div className="text-xs text-gray-500">ID: ...{task.patient_id.slice(-4)}</div>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">No Patient</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                                            {task.assigned_role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2 text-teal-500" />
                                                {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : <span className="italic text-gray-400">No due date</span>}
                                            </div>
                                            {task.due_date && (
                                                <span className="text-xs text-gray-400 ml-6">
                                                    {format(new Date(task.due_date), 'h:mm a')}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            {task.status !== 'completed' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCompleteTask(task.id)}
                                                    className="inline-flex items-center gap-1.5 border-green-200 text-green-700 hover:bg-green-50 px-2 py-1"
                                                    title="Mark Complete"
                                                >
                                                    <CheckCircle size={16} />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingTask(task);
                                                    setIsCreateModalOpen(true);
                                                }}
                                                className="border-gray-200 text-gray-600 hover:bg-gray-50 px-2 py-1"
                                                title="Edit Task"
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="border-gray-200 text-red-600 hover:bg-red-50 px-2 py-1"
                                                title="Delete Task"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isCreateModalOpen && (
                <CreateTaskModal
                    task={editingTask}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setEditingTask(null);
                    }}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        setEditingTask(null);
                        loadTasks();
                    }}
                />
            )}
        </div>
    );
}
