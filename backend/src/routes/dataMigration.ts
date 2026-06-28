// @ts-nocheck
// Data Migration Routes
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dataMigrationService from '../services/dataMigrationService';
import { authenticateToken as authenticate } from '../middleware/auth';

const router = express.Router();

// Configure multer for CSV upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/imports/';
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `import-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() === '.csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

/**
 * POST /api/data-migration/import
 * Upload CSV and start import job
 */
router.post('/import', authenticate, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CSV file uploaded' });
        }

        const userId = req.user.id;
        const importType = req.body.importType || 'patients';
        const dryRun = req.body.dryRun === 'true';

        // Process the import asynchronously
        // We don't await this so the response is immediate
        let result;
        if (importType === 'patients') {
            result = await dataMigrationService.importPatients(
                req.file.path,
                userId,
                dryRun ? 'dry-run' : 'live'
            );
        } else {
            // For now only patients are supported
            return res.status(400).json({ error: 'Unsupported import type' });
        }

        res.json({
            message: 'Import processed successfully',
            job: result
        });

    } catch (error: any) {
        console.error('Error processing import:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/data-migration/jobs
 * Get detailed list of all import jobs
 */
router.get('/jobs', authenticate, async (req, res) => {
    try {
        const jobs = await dataMigrationService.getAllImportJobs();
        res.json(jobs);
    } catch (error: any) {
        console.error('Error fetching import jobs:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/data-migration/jobs/:id/logs
 * Get logs for a specific job
 */
router.get('/jobs/:id/logs', authenticate, async (req, res) => {
    try {
        const logs = await dataMigrationService.getImportLogs(req.params.id);
        res.json(logs);
    } catch (error: any) {
        console.error('Error fetching job logs:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/data-migration/jobs/:id
 * Delete a job
 */
router.delete('/jobs/:id', authenticate, async (req, res) => {
    try {
        await dataMigrationService.deleteJob(parseInt(req.params.id));
        res.json({ message: 'Job deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
