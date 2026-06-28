import express from 'express';
import * as messagingController from '../controllers/messagingController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // All messaging routes require auth

router.get('/conversations', messagingController.getConversations);
router.get('/conversations/:id', messagingController.getConversationById);
router.post('/conversations', messagingController.createConversation);
router.get('/messages', messagingController.getMessages);
router.post('/messages', messagingController.sendMessage);
router.put('/messages/:id/read', messagingController.markAsRead);
router.put('/conversations/:id/read', messagingController.markConversationAsRead);
router.get('/unread-count', messagingController.getUnreadCount);

export default router;
