
import { Router } from 'express';
import * as TrackingController from '../controllers/trackingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Track action might be public or protected. 
// For now, let's keep it open but use auth middleware if token present (custom logic if needed)
// Or just protect it if all tracking is post-login.
// Assuming mixed usage, so we'll leave it open but controller checks for user.
// BUT, implementing `router.use(authenticateToken)` blocks unauthenticated.
// Let's make `track` public or optional auth, and `get` protected.
// For simplicity in this migration phase: Protect all.

router.post('/', authenticateToken, TrackingController.trackAction);
router.get('/', authenticateToken, TrackingController.getActions);
router.get('/stats', authenticateToken, TrackingController.getStats);

export default router;
