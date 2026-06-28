import { Request, Response } from 'express';
import { MessagingService } from '../services/messagingService';

export const getConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const conversations = await MessagingService.getConversations(userId);
        res.json(conversations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getConversationById = async (req: Request, res: Response) => {
    try {
        const conversation = await MessagingService.getConversationById(req.params.id as string);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json(conversation);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createConversation = async (req: Request, res: Response) => {
    try {
        const conversation = await MessagingService.createConversation(req.body);
        res.status(201).json(conversation);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { conversation_id } = req.query;
        if (!conversation_id) {
            return res.status(400).json({ error: 'conversation_id is required' });
        }
        const messages = await MessagingService.getMessages(conversation_id as string);
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const message = await MessagingService.sendMessage(req.body);
        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const message = await MessagingService.markAsRead(req.params.id as string);
        res.json(message);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const markConversationAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const messages = await MessagingService.markConversationAsRead(
            req.params.id as string,
            userId
        );
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const count = await MessagingService.getUnreadCount(userId);
        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
