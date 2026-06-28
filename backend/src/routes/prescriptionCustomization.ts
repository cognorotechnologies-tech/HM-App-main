// @ts-nocheck
// Prescription Customization Routes
import express from 'express';
import multer from 'multer';
import path from 'path';
import prescriptionCustomizationService from '../services/prescriptionCustomizationService';
import { authenticateToken as authenticate } from '../middleware/auth';

const router = express.Router();

// Configure multer for signature upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/signatures/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `signature-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for signatures'));
        }
    }
});

/**
 * GET /api/prescription-customization/templates
 * Get all available layout templates
 */
router.get('/templates', authenticate, async (req, res) => {
    try {
        const templates = await prescriptionCustomizationService.getAllTemplates();
        res.json(templates);
    } catch (error: any) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/prescription-customization/preferences
 * Get logged-in doctor's preferences
 */
router.get('/preferences', authenticate, async (req, res) => {
    try {
        const doctorId = req.user.doctor_id || req.user.id;
        const preferences = await prescriptionCustomizationService.getDoctorPreferencesDetailed(doctorId);

        res.json(preferences || { message: 'No preferences set. Using defaults.' });
    } catch (error: any) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/prescription-customization/preferences
 * Update doctor's prescription preferences
 */
router.put('/preferences', authenticate, async (req, res) => {
    try {
        const doctorId = req.user.doctor_id || req.user.id;
        const updatedPreferences = await prescriptionCustomizationService.updateDoctorPreferences(doctorId, req.body);

        res.json({ message: 'Preferences updated successfully', preferences: updatedPreferences });
    } catch (error: any) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/prescription-customization/signature
 * Upload doctor's signature
 */
router.post('/signature', authenticate, upload.single('signature'), async (req, res) => {
    try {
        const doctorId = req.user.doctor_id || req.user.id;

        if (!req.file) {
            return res.status(400).json({ error: 'No signature file uploaded' });
        }

        const signatureUrl = `/uploads/signatures/${req.file.filename}`;
        const signatureText = req.body.signature_text;

        const updated = await prescriptionCustomizationService.updateSignature(doctorId, signatureUrl, signatureText);

        res.json({ message: 'Signature uploaded successfully', signature_url: signatureUrl, preferences: updated });
    } catch (error: any) {
        console.error('Error uploading signature:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/prescription-customization/qr-code
 * Generate QR code data for a prescription
 */
router.post('/qr-code', authenticate, async (req, res) => {
    try {
        const { prescription_id, qr_type, custom_url } = req.body;
        const doctorId = req.user.doctor_id || req.user.id;

        const qrData = prescriptionCustomizationService.generateQRData(
            prescription_id,
            doctorId,
            qr_type,
            custom_url
        );

        res.json({ qr_data: qrData });
    } catch (error: any) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/prescription-customization/custom-template
 * Create a custom template
 */
router.post('/custom-template', authenticate, async (req, res) => {
    try {
        const doctorId = req.user.doctor_id || req.user.id;
        const template = await prescriptionCustomizationService.createCustomTemplate(doctorId, req.body);

        res.status(201).json({ message: 'Custom template created', template });
    } catch (error: any) {
        console.error('Error creating custom template:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
