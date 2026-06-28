import { useState, useEffect } from 'react';
import { UserPlus, User, Trash2, Calendar, Save, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { familyService, type FamilyMember, type NewFamilyMember } from '../../services/familyService';
import { format } from 'date-fns';

interface FamilyMemberListProps {
    patientId: string;
}

export function FamilyMemberList({ patientId }: FamilyMemberListProps) {
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddMode, setIsAddMode] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [relationship, setRelationship] = useState('child');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('other');
    const [submitting, setSubmitting] = useState(false);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const data = await familyService.getMembers(patientId);
            setMembers(data);
        } catch (error) {
            console.error('Error fetching family members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [patientId]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const newMember: NewFamilyMember = {
                patient_id: patientId,
                first_name: firstName,
                last_name: lastName,
                relationship,
                date_of_birth: dob || null,
                gender
            };

            await familyService.addMember(newMember);
            await fetchMembers();

            // Reset and close
            setIsAddMode(false);
            setFirstName('');
            setLastName('');
            setRelationship('child');
            setDob('');
            setGender('other');

        } catch (error) {
            console.error('Error adding member:', error);
            alert('Failed to add family member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this family member?')) return;
        try {
            await familyService.deleteMember(id);
            setMembers(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading family members...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Family Members</h3>
                {!isAddMode && (
                    <Button onClick={() => setIsAddMode(true)} className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none">
                        <UserPlus size={18} />
                        Add Member
                    </Button>
                )}
            </div>

            {isAddMode && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-blue-900">Add New Family Member</h4>
                        <button onClick={() => setIsAddMode(false)} className="text-blue-400 hover:text-blue-600">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">First Name</label>
                            <input
                                required
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border-blue-200 border focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Last Name</label>
                            <input
                                required
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border-blue-200 border focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Relationship</label>
                            <select
                                value={relationship}
                                onChange={e => setRelationship(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border-blue-200 border focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="child">Child</option>
                                <option value="spouse">Spouse</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Gender</label>
                            <select
                                value={gender}
                                onChange={e => setGender(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border-blue-200 border focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border-blue-200 border focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddMode(false)} className="bg-white">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting} className="flex items-center gap-2 bg-blue-600 text-white">
                                <Save size={16} />
                                {submitting ? 'Saving...' : 'Save Family Member'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map(member => (
                    <div key={member.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                <User size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{member.first_name} {member.last_name}</h4>
                                <p className="text-sm text-gray-500 capitalize">{member.relationship}</p>
                                {member.date_of_birth && (
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                        <Calendar size={12} />
                                        {format(new Date(member.date_of_birth), 'MMM d, yyyy')}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(member.id)}
                            className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {members.length === 0 && !isAddMode && (
                    <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 mb-2">No family members added yet.</p>
                        <Button variant="outline" size="sm" onClick={() => setIsAddMode(true)}>
                            Add your first family member
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
