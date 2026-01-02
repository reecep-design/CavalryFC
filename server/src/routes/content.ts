import { Router } from 'express';
import { db } from '../db';
import { siteContent } from '../db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

export const contentRoutes = Router();

// GET /api/content/:key
contentRoutes.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const result = await db.select().from(siteContent).where(eq(siteContent.key, key)).limit(1);
        if (result.length > 0) {
            res.json(result[0].content);
        } else {
            res.json(null); // Return null if not set, frontend will use defaults
        }
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

// POST /api/content/:key (Admin Protected)
contentRoutes.post('/:key', async (req, res) => {
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { key } = req.params;
    const content = req.body; // Expecting JSON object

    try {
        await db.insert(siteContent)
            .values({ key, content })
            .onConflictDoUpdate({
                target: siteContent.key,
                set: { content, updatedAt: new Date() }
            });

        res.json({ success: true });
    } catch (error) {
        console.error('Update content error:', error);
        res.status(500).json({ error: 'Failed to update content' });
    }
});
