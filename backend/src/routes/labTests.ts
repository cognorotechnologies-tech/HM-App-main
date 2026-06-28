// @ts-nocheck
// Lab Test Routes
import express from 'express';
import labTestService from '../services/labTestService';
import { authenticateToken as authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/lab-tests
 * Get all available lab tests
 */
router.get('/', async (req, res) => {
    try {
        const category = req.query.category as string | undefined;
        const tests = await labTestService.getAllTests(category);
        res.json(tests);
    } catch (error: any) {
        console.error('Error fetching lab tests:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/lab-tests/popular
 * Get popular tests
 */
router.get('/popular', async (req, res) => {
    try {
        const tests = await labTestService.getPopularTests();
        res.json(tests);
    } catch (error: any) {
        console.error('Error fetching popular tests:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/lab-tests/categories
 * Get test categories
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await labTestService.getTestCategories();
        res.json(categories);
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/lab-tests/:id
 * Get test by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const test = await labTestService.getTestById(parseInt(req.params.id));
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        res.json(test);
    } catch (error: any) {
        console.error('Error fetching test:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
