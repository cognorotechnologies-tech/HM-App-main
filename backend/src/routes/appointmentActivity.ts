// @ts-nocheck
// Appointment Activity Routes
import express from 'express';
import appointmentActivityService from '../services/appointmentActivityService';
import { authenticateToken as authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/appointment-activity/:appointmentId
 * Get all activity for a specific appointment
 */
router.get('/:appointmentId', authenticate, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const activities = await appointmentActivityService.getByAppointment(appointmentId);

        res.json(activities);
    } catch (error: any) {
        console.error('Error fetching appointment activity:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/appointment-activity/:appointmentId/view
 * Get human-readable activity view with joins
 */
router.get('/:appointmentId/view', authenticate, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const activityView = await appointmentActivityService.getActivityView(appointmentId);

        res.json(activityView);
    } catch (error: any) {
        console.error('Error fetching appointment activity view:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/appointment-activity
 * Create manual activity log entry
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { appointment_id, action_type, description, metadata } = req.body;
        const user_id = req.user.id;

        const activityId = await appointmentActivityService.createActivity({
            appointment_id,
            user_id,
            action_type,
            description,
            metadata
        });

        res.status(201).json({ id: activityId, message: 'Activity logged successfully' });
    } catch (error: any) {
        console.error('Error creating appointment activity:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/appointment-activity/:appointmentId/payment
 * Log payment received
 */
router.post('/:appointmentId/payment', authenticate, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { amount, method } = req.body;
        const user_id = req.user.id;

        const activityId = await appointmentActivityService.logPayment(
            appointmentId,
            user_id,
            amount,
            method
        );

        res.status(201).json({ id: activityId, message: 'Payment logged successfully' });
    } catch (error: any) {
        console.error('Error logging payment:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/appointment-activity/:appointmentId/note
 * Log note added
 */
router.post('/:appointmentId/note', authenticate, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { note } = req.body;
        const user_id = req.user.id;

        const activityId = await appointmentActivityService.logNote(
            appointmentId, // Pass string directly
            user_id,
            note
        );

        res.status(201).json({ id: activityId, message: 'Note logged successfully' });
    } catch (error: any) {
        console.error('Error logging note:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/appointment-activity/recent
 * Get recent activity across all appointments (admin)
 */
router.get('/recent/all', authenticate, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const activities = await appointmentActivityService.getRecentActivity(limit);

        res.json(activities);
    } catch (error: any) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/appointment-activity/:appointmentId/stats
 * Get activity statistics for an appointment
 */
router.get('/:appointmentId/stats', authenticate, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const stats = await appointmentActivityService.getActivityStats(appointmentId);

        res.json(stats);
    } catch (error: any) {
        console.error('Error fetching activity stats:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
