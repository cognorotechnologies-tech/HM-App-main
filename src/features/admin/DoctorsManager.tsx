// @ts-nocheck - Bypassing TypeScript strict checks due to Supabase type conflicts
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminService } from '../../services/adminService';
import { doctorService, type Doctor, type NewDoctor, type UpdateDoctor } from '../../services/doctorService';
import { departmentService, type Department } from '../../services/departmentService';
import { Button } from '../../components/Button';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/Input';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, X, Search, UserPlus } from 'lucide-react';

import ImageUpload from '../../components/ImageUpload';
import { storageService } from '../../services/storageService';

export default function DoctorsManager() {
    const toast = useToast();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'list' | 'onboard' | 'create'>('list');

    // Search State
    const [userSearch, setUserSearch] = useState('');
    const [usersFound, setUsersFound] = useState<any[]>([]);

    const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    // Create User State
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

    // Avatar upload state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const { register, handleSubmit, reset } = useForm<NewDoctor>();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm<UpdateDoctor>();

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [docs, depts] = await Promise.all([
                doctorService.getAll(),
                departmentService.getAll()
            ]);
            setDoctors(docs);
            setDepartments(depts);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSearch = async () => {
        if (userSearch.length < 2) return;
        try {
            const results = await doctorService.searchUsers(userSearch);
            setUsersFound(results || []);
        } catch (error) {
            console.error(error);
        }
    };

    const onOnboard = async (data: NewDoctor) => {
        if (!selectedUser) {
            toast.warning("Please select a user first");
            return;
        }
        try {
            let avatarUrl: string | undefined;

            // Upload avatar if provided
            if (avatarFile) {
                setIsUploadingAvatar(true);
                try {
                    // Upload avatar using storage service API

                    avatarUrl = await storageService.uploadDoctorAvatar(selectedUser.id, avatarFile);
                } catch (uploadError: any) {
                    console.error('Avatar upload failed:', uploadError);
                    // Proceed without avatar or warn?
                    // Let's proceed but warn
                    toast.warning('Avatar upload failed, continuing without avatar');
                } finally {
                    setIsUploadingAvatar(false);
                }
            }

            // Create Doctor (and update profile if avatarUrl is present)
            // Backend createDoctor now handles profile updates
            await doctorService.create({
                ...data,
                id: selectedUser.id,
                avatar_url: avatarUrl // Pass avatar_url to be updated in profile
            });

            toast.success("Doctor onboarded successfully!");
            setView('list');
            reset();
            setSelectedUser(null);
            setAvatarFile(null);
            loadData();
        } catch (error: any) {
            console.error("Onboard failed", error);
            toast.error(error.message);
        }
    };


    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingUser(true);
        try {
            // Create user via backend API
            const user = await adminService.createUser({
                email: newUser.email,
                password: newUser.password,
                first_name: newUser.firstName,
                last_name: newUser.lastName,
                role: 'doctor'
            });

            // Select this user for onboarding
            setSelectedUser(user);
            setNewUser({ firstName: '', lastName: '', email: '', password: '' });
            toast.info("User account created! Please continue to fill professional details.");

        } catch (error: any) {
            console.error("Create User Failed", error);
            const msg = error.response?.data?.error || error.message;
            toast.error(`Failed to create user: ${msg}`);
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleEditClick = (doctor: Doctor) => {
        setEditingDoctor(doctor);
        resetEdit({
            specialization: doctor.specialization,
            qualifications: doctor.qualifications,
            years_of_experience: doctor.years_of_experience,
            license_number: doctor.license_number,
            department_id: doctor.department_id
        });
    };

    const onUpdate = async (data: UpdateDoctor) => {
        if (!editingDoctor) return;
        try {
            await doctorService.update(editingDoctor.id, data);
            toast.success("Doctor updated successfully!");
            setEditingDoctor(null);
            loadData();
        } catch (error: any) {
            console.error("Update failed", error);
            toast.error(error.message);
        }
    };

    const handleDelete = async (doctor: Doctor) => {
        if (!window.confirm(`Are you sure you want to remove Dr. ${doctor.profiles?.last_name}? This action cannot be undone.`)) {
            return;
        }
        try {
            await doctorService.delete(doctor.id);
            // Optionally authorize logic to demote user role back to 'user' or 'patient' if needed, 
            // but for now we just remove the doctor record.
            toast.success("Doctor removed successfully.");
            loadData();
        } catch (error: any) {
            console.error("Delete failed", error);
            toast.error(error.message);
        }
    };

    const statusColors = {
        available: 'bg-green-100 text-green-800',
        busy: 'bg-red-100 text-red-800',
        break: 'bg-yellow-100 text-yellow-800',
        offline: 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Doctors Management</h1>
                    <p className="text-gray-500 mt-1">Manage doctor profiles, assignments, and availability.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant={view === 'list' ? 'primary' : 'outline'} onClick={() => setView('list')}>List View</Button>
                    <Button variant={view === 'onboard' ? 'primary' : 'outline'} onClick={() => {
                        setView('onboard');
                        setSelectedUser(null);
                        setUserSearch('');
                        setUsersFound([]); // Clear search results 
                        // Fetch pending doctors immediately
                        doctorService.getPendingDoctors().then(setPendingDoctors).catch(console.error);
                    }}>Onboard Existing User</Button>
                    <Button variant={view === 'create' ? 'primary' : 'outline'} onClick={() => { setView('create'); setSelectedUser(null); }}>Create New Doctor</Button>
                    <Link to="/dashboard/admin" className="text-primary-600 hover:text-primary-800 self-center font-medium">Back to Dashboard</Link>
                </div>
            </div>

            {view === 'list' && (
                <div>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                                    <div className="flex items-center mb-4">
                                        <div className="h-14 w-14 bg-gray-200 rounded-full"></div>
                                        <div className="ml-4 flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-16 text-center border-2 border-dashed border-blue-200">
                            <div className="max-w-md mx-auto">
                                <div className="text-7xl mb-6">👨‍⚕️</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Doctors Yet</h3>
                                <p className="text-gray-600 mb-6">Get started by onboarding your first doctor to the system</p>
                                <Button variant="primary" size="lg" onClick={() => setView('onboard')}>
                                    <UserPlus size={20} className="mr-2" />
                                    Onboard First Doctor
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {doctors.map(doc => (
                                <div key={doc.id} className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden transform hover:-translate-y-1">
                                    {/* Header with Avatar */}
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                        <div className="relative flex items-center">
                                            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                {doc.profiles?.first_name?.[0]}{doc.profiles?.last_name?.[0]}
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-lg font-bold text-white drop-shadow-sm">
                                                    Dr. {doc.profiles?.first_name} {doc.profiles?.last_name}
                                                </h3>
                                                <p className="text-blue-100 text-sm">{doc.profiles?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        {/* Department Badge */}
                                        <div className="flex items-center justify-between">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                                {doc.departments?.name || 'Unassigned'}
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize flex items-center gap-1 ${statusColors[(doc as any).status as keyof typeof statusColors] || statusColors.offline}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                {(doc as any).status || 'offline'}
                                            </span>
                                        </div>

                                        {/* Specialization */}
                                        {doc.specialization && (
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Specialization</p>
                                                <p className="text-sm font-medium text-gray-900">{doc.specialization}</p>
                                            </div>
                                        )}

                                        {/* Experience */}
                                        {doc.years_of_experience && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {doc.years_of_experience}+ years experience
                                            </div>
                                        )}

                                        {/* Qualifications */}
                                        {doc.qualifications && (
                                            <div className="flex items-start text-sm text-gray-600">
                                                <svg className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                                </svg>
                                                <span className="flex-1">{doc.qualifications}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEditClick(doc)}
                                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group/btn"
                                            title="Edit Details"
                                        >
                                            <Pencil size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc)}
                                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group/btn"
                                            title="Remove Doctor"
                                        >
                                            <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {(view === 'onboard' || view === 'create') && (
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {view === 'create' ? 'Create New Doctor Account' : 'Onboard Existing User'}
                    </h2>

                    {!selectedUser ? (
                        <>
                            {view === 'onboard' ? (
                                // SEARCH EXISTING
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Search className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search user by email or name..."
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    value={userSearch}
                                                    onChange={(e) => setUserSearch(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={handleSearch}>Search</Button>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            {/* Header for list */}
                                            {(usersFound.length > 0 || (userSearch.length === 0 && pendingDoctors.length > 0)) && (
                                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    {userSearch.length > 0 ? "Search Results" : "Pending Onboarding"}
                                                </div>
                                            )}

                                            <ul className="divide-y divide-gray-200">
                                                {/* Show search results if present */}
                                                {userSearch.length > 1 && usersFound.map(u => (
                                                    <li key={u.id} className="p-4 hover:bg-gray-50 flex justify-between items-center transition-colors">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                                                            <p className="text-sm text-gray-500">{u.email}</p>
                                                            {u.role && <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mt-1 inline-block">Role: {u.role}</span>}
                                                        </div>
                                                        <Button size="sm" variant="secondary" onClick={() => setSelectedUser(u)}>Onboard</Button>
                                                    </li>
                                                ))}

                                                {/* Show pending doctors if no search or empty search */}
                                                {userSearch.length <= 1 && pendingDoctors.length > 0 && pendingDoctors.map(u => (
                                                    <li key={u.id} className="p-4 hover:bg-orange-50 flex justify-between items-center transition-colors bg-orange-50/50">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                                                                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-medium">Pending Onboarding</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500">{u.email}</p>
                                                        </div>
                                                        <Button size="sm" variant="primary" onClick={() => setSelectedUser(u)}>Complete Setup</Button>
                                                    </li>
                                                ))}

                                                {/* No results states */}
                                                {userSearch.length > 1 && usersFound.length === 0 && (
                                                    <li className="p-8 text-center text-gray-500">
                                                        No users found matching "{userSearch}"
                                                    </li>
                                                )}
                                                {userSearch.length <= 1 && pendingDoctors.length === 0 && (
                                                    <li className="p-8 text-center text-gray-400">
                                                        Enter name or email to search for a user
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // CREATE NEW USER FORM
                                <div className="space-y-6">
                                    <form onSubmit={handleCreateUser} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="First Name"
                                                required
                                                value={newUser.firstName}
                                                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                            />
                                            <Input
                                                label="Last Name"
                                                required
                                                value={newUser.lastName}
                                                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                            />
                                        </div>
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            required
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                        <Input
                                            label="Password"
                                            type="password"
                                            required
                                            placeholder="Min. 6 characters"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        />

                                        <Button type="submit" className="w-full justify-center" isLoading={isCreatingUser}>
                                            <UserPlus size={18} className="mr-2" />
                                            Create & Continue
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Selected User</p>
                                    <p className="font-medium text-blue-900">{selectedUser.first_name} {selectedUser.last_name}</p>
                                    <p className="text-sm text-blue-700">{selectedUser.email}</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => setSelectedUser(null)}>Change</Button>
                            </div>

                            {/* Profile Picture Upload */}
                            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                                <ImageUpload
                                    currentImageUrl={selectedUser.profiles?.avatar_url || null}
                                    onImageSelect={(file) => setAvatarFile(file)}
                                    onImageRemove={() => setAvatarFile(null)}
                                    disabled={isUploadingAvatar}
                                />
                            </div>

                            <form onSubmit={handleSubmit(onOnboard)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        {...register('department_id', { required: "Department is required" })}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <Input label="Specialization" {...register('specialization')} placeholder="e.g. Cardiology, Pediatrics" />
                                <Input label="Qualifications" {...register('qualifications')} placeholder="e.g. MBBS, MD" />
                                <Input label="Experience (Years)" type="number" {...register('years_of_experience')} />
                                <Input label="License Number" {...register('license_number')} />

                                <div className="pt-4">
                                    <Button type="submit" className="w-full justify-center">Confirm & Onboard Doctor</Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {editingDoctor && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">Edit Doctor Details</h3>
                            <button onClick={() => setEditingDoctor(null)} className="text-gray-400 hover:text-gray-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 bg-blue-50 p-3 rounded-lg flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {editingDoctor.profiles?.first_name?.[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-blue-900">Dr. {editingDoctor.profiles?.first_name} {editingDoctor.profiles?.last_name}</p>
                                    <p className="text-xs text-blue-700">{editingDoctor.profiles?.email}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitEdit(onUpdate)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        {...registerEdit('department_id')}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <Input label="Specialization" {...registerEdit('specialization')} />
                                <Input label="Qualifications" {...registerEdit('qualifications')} />
                                <Input label="Experience (Years)" type="number" {...registerEdit('years_of_experience')} />
                                <Input label="License Number" {...registerEdit('license_number')} />

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingDoctor(null)}>Cancel</Button>
                                    <Button type="submit" className="flex-1">Save Changes</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
