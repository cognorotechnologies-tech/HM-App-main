import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { departmentService, type Department, type NewDepartment } from '../../services/departmentService';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Link } from 'react-router-dom';

export default function DepartmentsManager() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { register, handleSubmit, reset } = useForm<NewDepartment>();

    const loadDepartments = async () => {
        try {
            const data = await departmentService.getAll();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const onSubmit = async (data: NewDepartment) => {
        try {
            if (editingId) {
                await departmentService.update(editingId, data);
                setEditingId(null);
            } else {
                await departmentService.create(data);
            }
            reset();
            loadDepartments();
        } catch (error) {
            console.error('Failed to save department', error);
        }
    };

    const onEdit = (dept: Department) => {
        setEditingId(dept.id);
        reset({ name: dept.name, description: dept.description });
    };

    const onDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this department?')) {
            try {
                await departmentService.delete(id);
                loadDepartments();
            } catch (error) {
                console.error('Failed to delete department', error);
            }
        }
    };

    const onCancel = () => {
        setEditingId(null);
        reset({ name: '', description: '' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Departments Management</h1>
                <Link to="/dashboard/admin" className="text-primary-600 hover:text-primary-800">
                    Back to Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-md">
                            {editingId ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            )}
                        </div>
                        {editingId ? 'Edit Department' : 'Add Department'}
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Department Name"
                            {...register('name', { required: true })}
                            placeholder="e.g., Cardiology"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
                                placeholder="Brief description of the department..."
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                                {editingId ? 'Update Department' : 'Add Department'}
                            </Button>
                            {editingId && (
                                <Button type="button" variant="outline" onClick={onCancel} className="border-2">
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="md:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                        <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            All Departments ({departments.length})
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-600"></div>
                            <p className="mt-4 text-gray-500 text-sm">Loading departments...</p>
                        </div>
                    ) : departments.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <p className="text-gray-500 font-medium">No departments yet</p>
                            <p className="text-gray-400 text-sm mt-1">Add your first department to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                                                </svg>
                                                Department Name
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-green-700 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                Description
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-green-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {departments.map((dept) => (
                                        <tr key={dept.id} className="hover:bg-green-50/50 transition-all duration-200 group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md mr-4 ring-2 ring-green-100 group-hover:ring-green-200 transition-all">
                                                        {dept.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                                                        {dept.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-600">
                                                {dept.description || <span className="italic text-gray-400">No description</span>}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => onEdit(dept)}
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 group/edit"
                                                        title="Edit Department"
                                                    >
                                                        <svg className="w-5 h-5 group-hover/edit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(dept.id)}
                                                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group/delete"
                                                        title="Delete Department"
                                                    >
                                                        <svg className="w-5 h-5 group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
