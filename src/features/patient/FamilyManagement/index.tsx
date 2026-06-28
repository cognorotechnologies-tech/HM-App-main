import { useState, useEffect } from 'react';
import { Users, Plus, UserPlus, Trash2, Settings } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../contexts/ToastContext';
import { familyService } from '../../../services/familyService';
import AddFamilyMemberModal from './AddFamilyMemberModal';

export default function FamilyManagement() {
    const { user } = useAuthStore();
    const toast = useToast();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (user) {
            loadMembers();
        }
    }, [user]);

    const loadMembers = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await familyService.getMembers(user.id);
            setMembers(data || []);
        } catch (error: any) {
            console.error('Error loading family members:', error);
            toast.error('Failed to load family members');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this family member?')) return;

        try {
            await familyService.removeMember(memberId);
            toast.success('Family member removed successfully');
            loadMembers();
        } catch (error: any) {
            console.error('Error removing member:', error);
            toast.error('Failed to remove family member');
        }
    };

    const handleUpdatePermissions = async (memberId: string, permissions: any) => {
        try {
            await familyService.updatePermissions(memberId, permissions);
            toast.success('Permissions updated successfully');
            loadMembers();
        } catch (error: any) {
            console.error('Error updating permissions:', error);
            toast.error('Failed to update permissions');
        }
    };

    if (!user) {
        return <div>Please log in to manage family members</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-8 h-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Family Management</h1>
                        </div>
                        <p className="text-gray-600">
                            Manage your family members and their healthcare access
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add Family Member
                    </button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Total Members</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{members.length}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <UserPlus className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-900">Can Book</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                        {members.filter(m => m.can_book_appointments).length}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900">Full Access</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                        {members.filter(m => m.can_view_medical_history && m.can_view_prescriptions).length}
                    </p>
                </div>
            </div>

            {/* Family Members List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 mt-2">Loading family members...</p>
                </div>
            ) : members.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Family Members Yet</h3>
                    <p className="text-gray-600 mb-4">
                        Add family members to book appointments and manage their healthcare
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Add First Member
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                        <Users className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {member.first_name} {member.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-600 capitalize">{member.relationship}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Permissions */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={member.can_book_appointments}
                                        onChange={(e) =>
                                            handleUpdatePermissions(member.id, {
                                                ...member,
                                                can_book_appointments: e.target.checked
                                            })
                                        }
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700">Can book appointments</span>
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={member.can_view_medical_history}
                                        onChange={(e) =>
                                            handleUpdatePermissions(member.id, {
                                                ...member,
                                                can_view_medical_history: e.target.checked
                                            })
                                        }
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700">Can view medical history</span>
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={member.can_view_prescriptions}
                                        onChange={(e) =>
                                            handleUpdatePermissions(member.id, {
                                                ...member,
                                                can_view_prescriptions: e.target.checked
                                            })
                                        }
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700">Can view prescriptions</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Member Modal */}
            {showAddModal && (
                <AddFamilyMemberModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        loadMembers();
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
}
