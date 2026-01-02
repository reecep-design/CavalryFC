import { Router } from 'express';
import { db } from '../db';
import { teams } from '../db/schema';
import { eq } from 'drizzle-orm';

export const teamRoutes = Router();

// GET /api/teams (Public)
teamRoutes.get('/', async (req, res) => {
    try {
        const allTeams = await db.query.teams.findMany({
            with: {
                // We could relationally load registrations, but just a count is better? 
                // schema doesn't have explicit relation definition in `teams` export likely without `relations` helper.
                // Let's just do a raw count query or load all regs (not scalable but fine for this scale).
            }
        });

        // Get counts manually for safety if relations aren't perfectly set up
        const allRegs = await db.query.registrations.findMany();

        const teamsWithCounts = allTeams.map(team => {
            const count = allRegs.filter(r => r.teamId === team.id && r.paymentStatus === 'paid').length;
            // Note: We count PAID. Unpaid/Waitlist don't count towards capacity? 
            // Usually 'unpaid' shouldn't persist long unless it's an abandoned checkout.
            // Let's count 'paid' only for capacity enforcement.
            // Wait, what if someone is in the middle of checkout? 
            // For now, simple: Count 'paid'.

            return {
                ...team,
                registrationCount: count
            };
        });

        res.json(teamsWithCounts);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// GET /api/teams/:id (Public)
teamRoutes.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query.teams.findFirst({
            where: eq(teams.id, parseInt(id))
        });

        if (!result) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(result);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// POST /api/teams (Admin protected - middleware later)
teamRoutes.post('/', async (req, res) => {
    const { name, priceCents, capacity, description, open } = req.body;
    try {
        const newTeam = await db.insert(teams).values({
            name,
            priceCents,
            capacity,
            description,
            open: open ?? true,
        }).returning();
        res.json(newTeam[0]);
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: 'Failed to create team' });
    }
});

// PATCH /api/teams/:id (Admin protected)
teamRoutes.patch('/:id', async (req, res) => {
    // Simple Admin Check
    const password = req.headers['x-admin-password'];
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedTeam = await db.update(teams)
            .set(updates)
            .where(eq(teams.id, parseInt(id)))
            .returning();
        res.json(updatedTeam[0]);
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Failed to update team' });
    }
});
