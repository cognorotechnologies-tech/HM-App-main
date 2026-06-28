/* eslint-disable @typescript-eslint/no-unused-vars */
 
import api from '../lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const storageService = {
    /**
     * Upload a doctor's profile picture
     */
    async uploadDoctorAvatar(doctorId: string, file: File): Promise<string> {
        // Validate file size and type
        if (file.size > 5 * 1024 * 1024) throw new Error('File size must be less than 5MB');
        if (!['image/jpeg', 'image/png'].includes(file.type)) throw new Error('Only JPG and PNG images are allowed');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'avatar');
        formData.append('entity_id', doctorId);

        const { data } = await api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Return full URL
        return `${API_URL}${data.url}`;
    },

    /**
     * Delete a doctor's profile picture
     * Note: In current implementation, we might not strictly need to delete old avatars as new ones replace them in UI reference,
     * but we could implement a cleanup endpoint later. For now, this is a placeholder or no-op since direct file deletion
     * is handled by the upload overwrite logic or not exposed directly for avatars.
     */
    async deleteDoctorAvatar(doctorId: string): Promise<void> {
        // No-op for now unless we add specific avatar deletion endpoint
        // or we could delete the file if we knew the filename
    },

    /**
     * Get the public URL for a doctor's avatar
     * This relies on understanding how the filename is stored.
     * Ideally, the doctor profile in DB should store the avatar_url.
     * If this method is used to guess the URL, it won't work well with random filenames.
     * The refactor should ensure 'uploadDoctorAvatar' returns the URL which is then saved to the doctor profile.
     */
    getDoctorAvatarUrl(doctorId: string, extension: string = 'jpg'): string {
        // This legacy method assumes predictable filenames.
        // We might need to deprecate this or update how it works.
        // For now, return a placeholder or empty if we can't guess.
        return '';
    },

    async checkBucketExists(): Promise<boolean> {
        return true; // Always true for local storage
    }
};
