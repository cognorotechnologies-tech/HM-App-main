import express from 'express';
import { generateDiagnosisSuggestions, summarizeClinicalNotes, analyzeLabReport } from '../services/aiService';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';
import fs from 'fs';

const router = express.Router();

router.post('/diagnosis-suggestion', authenticateToken, async (req, res) => {
    try {
        const { symptoms, gender, age } = req.body;

        if (!symptoms) {
            return res.status(400).json({ error: "Symptoms are required" });
        }

        const suggestions = await generateDiagnosisSuggestions(symptoms, gender || "unknown", age || 0);
        res.json({ suggestions });
    } catch (error) {
        console.error("Diagnosis suggestion error:", error);
        res.status(500).json({ error: "Failed to generate suggestions" });
    }
});

router.post('/summarize-notes', authenticateToken, async (req, res) => {
    try {
        const { notes } = req.body;
        if (!notes || !Array.isArray(notes)) {
            return res.status(400).json({ error: "Notes array is required" });
        }

        const summary = await summarizeClinicalNotes(notes);
        res.json({ summary });
    } catch (error) {
        console.error("Summary error:", error);
        res.status(500).json({ error: "Failed to generate summary" });
    }
});

router.post('/analyze-report', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "File is required" });
        }

        const mimeType = req.file.mimetype;
        const filePath = req.file.path;
        const fileBuffer = fs.readFileSync(filePath);

        const analysis = await analyzeLabReport(fileBuffer, mimeType);

        // Clean up file if needed? Or keep it? keeping it for now in uploads

        res.json({ analysis, filePath: `/uploads/${req.file.filename}` });

    } catch (error) {
        console.error("Lab report analysis error:", error);
        res.status(500).json({ error: "Failed to analyze report" });
    }
});

router.post('/patient-summary', authenticateToken, async (req, res) => {
    try {
        const { medicalHistory, vitals } = req.body;

        // Mock implementation for now as the actual service method might need external AI
        // In a real app, this would call generatePatientSummary from aiService

        // Construct a simple summary if AI generation fails or is mocked
        const vitalSummary = vitals && vitals.length > 0
            ? `Recent vitals indicate ${vitals[0].metric_type} of ${vitals[0].value}.`
            : "No recent vitals available.";

        const conditions = medicalHistory?.chronic_conditions?.join(", ") || "no chronic conditions";

        const summary = `Patient has a history of ${conditions}. ${vitalSummary} Recommended to review recent lab work.`;

        // If we want to use the real service:
        // const summary = await generatePatientSummary(medicalHistory, vitals);

        res.json({ summary });
    } catch (error) {
        console.error("Patient summary error:", error);
        res.status(500).json({ error: "Failed to generate patient summary" });
    }
});

export default router;
