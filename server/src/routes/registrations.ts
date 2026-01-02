import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { registrations, teams } from '../db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

import { Parser } from 'json2csv';
import { desc } from 'drizzle-orm';

export const registrationRoutes = Router();

// Middleware-like function for admin check
const checkAdmin = (req: any, res: any, next: any) => {
    const password = req.headers['x-admin-password'];
    if (password === process.env.ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// POST /api/registrations/seed (Dev/Admin)
registrationRoutes.post('/seed', async (req, res) => {
    try {
        const allTeams = await db.query.teams.findMany();
        if (allTeams.length < 4) return res.status(400).json({ error: 'Need at least 4 teams seeded to run this' });

        // Pick 4 teams
        const targetTeams = allTeams.slice(0, 4);
        const dummyData: any[] = [];

        for (const team of targetTeams) {
            for (let i = 1; i <= 5; i++) {
                dummyData.push({
                    teamId: team.id,
                    playerFirstName: `Player${i}`,
                    playerLastName: `${team.name.split(' ')[0]}_${i}`, // e.g. 2017_1
                    dateOfBirth: '2015-01-01',
                    guardian1FirstName: `ParentFirst${i}`,
                    guardian1LastName: `ParentLast${i}`,
                    guardian1Email: `parent${i}@example.com`,
                    guardian1Phone: '555-0000',
                    street1: '123 Seed St',
                    city: 'Seed City',
                    state: 'VA',
                    zip: '20120',
                    amountCents: team.priceCents,
                    paymentStatus: 'paid' as const,
                    stripeCheckoutSessionId: `sess_seed_${team.id}_${i}`,
                    stripePaymentIntentId: `pi_seed_${team.id}_${i}`,
                    paidAt: new Date(),
                    waiverAccepted: true,
                    photoReleaseAccepted: true,
                    codeOfConductAccepted: true,
                    ageVerificationAccepted: true,
                });
            }
        }

        const inserted = await db.insert(registrations).values(dummyData).returning();
        res.json({ message: 'Seeded 20 dummy registrations', count: inserted.length });

    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Failed to seed registrations' });
    }
});

// POST /api/registrations/auth
registrationRoutes.post('/auth', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ status: 'ok' });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// GET /api/registrations (Admin)
registrationRoutes.get('/', checkAdmin, async (req, res) => {
    try {
        const all = await db.query.registrations.findMany({
            orderBy: [desc(registrations.createdAt)],
            with: {
                // Return relational data if configured
            }
        });

        // Fetch teams to map IDs to names manually if relationship isn't auto-pulling
        const allTeams = await db.query.teams.findMany();
        const teamMap = new Map(allTeams.map(t => [t.id, t.name]));

        const enriched = all.map(r => ({
            ...r,
            teamName: r.teamId ? teamMap.get(r.teamId) : 'Unknown',
            // Helper for UI compatibility if needed, though UI should update to use First/Last
            guardian1Name: `${r.guardian1FirstName} ${r.guardian1LastName}`,
        }));

        res.json(enriched);
    } catch (error) {
        console.error('List error:', error);
        res.status(500).json({ error: 'Failed to fetch list' });
    }
});

// POST /api/registrations/waitlist
// Adds user to waitlist without payment
registrationRoutes.post('/waitlist', async (req, res) => {
    const data = req.body;
    try {
        const team = await db.query.teams.findFirst({
            where: eq(teams.id, data.teamId),
        });
        if (!team) return res.status(404).json({ error: 'Team not found' });

        const newReg = await db.insert(registrations).values({
            ...data,
            amountCents: team.priceCents, // Keeping price info but unpaid
            paymentStatus: 'unpaid',
            isWaitlist: true,
        }).returning();

        res.json({ status: 'waitlisted', registration: newReg[0] });
    } catch (error) {
        console.error('Waitlist error:', error);
        res.status(500).json({ error: 'Failed to join waitlist' });
    }
});

// GET /api/registrations/export (Admin)
registrationRoutes.get('/export', async (req, res) => {
    try {
        const allRegistrations = await db.query.registrations.findMany({
            orderBy: [desc(registrations.createdAt)],
        });

        const allTeams = await db.query.teams.findMany();
        const teamMap = new Map(allTeams.map(t => [t.id, t.name]));

        // Transform for CSV
        const csvData = allRegistrations.map(reg => ({
            'Player Name': `${reg.playerLastName}, ${reg.playerFirstName}`,
            'Team': reg.teamId ? teamMap.get(reg.teamId) : 'Unknown',
            'Status': reg.isWaitlist ? 'WAITLIST' : reg.paymentStatus, // Show WAITLIST in status
            'DOB': reg.dateOfBirth,
            'Guardian 1 First': reg.guardian1FirstName,
            'Guardian 1 Last': reg.guardian1LastName,
            'Guardian 1 Email': reg.guardian1Email,
            'Guardian 1 Phone': reg.guardian1Phone,
            'Guardian 2 First': reg.guardian2FirstName || '',
            'Guardian 2 Last': reg.guardian2LastName || '',
            'Guardian 2 Email': reg.guardian2Email || '',
            'Guardian 2 Phone': reg.guardian2Phone || '',
            'Address': `${reg.street1} ${reg.street2 || ''}, ${reg.city}, ${reg.state} ${reg.zip}`,
            'Amount': (reg.amountCents / 100).toFixed(2),
            'Date': reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '',
            'Jersey Size': reg.jerseySize,
            'Short Size': reg.shortSize,
            'Medical Notes': reg.medicalNotes,
            'Age Verified': reg.ageVerificationAccepted ? 'Yes' : 'No',
        }));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`registrations-${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export registrations' });
    }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// POST /api/registrations/checkout
// Creates a pending registration and a Stripe Checkout Session
registrationRoutes.post('/checkout', async (req, res) => {
    const data = req.body; // Expects full form data including teamId

    try {
        // 1. Get Team Info for pricing
        const team = await db.query.teams.findFirst({
            where: eq(teams.id, data.teamId),
        });

        if (!team) return res.status(404).json({ error: 'Team not found' });

        // 2. Create Pending Registration Record
        const newReg = await db.insert(registrations).values({
            ...data,
            amountCents: team.priceCents,
            paymentStatus: 'unpaid',
        }).returning();

        const regId = newReg[0].id;

        // 3. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: data.guardian1Email, // Triggers Stripe Receipt
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${team.name} Registration`,
                            description: `Player: ${data.playerFirstName} ${data.playerLastName}`,
                        },
                        unit_amount: team.priceCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/?canceled=true`,
            metadata: {
                registrationId: regId.toString(),
            },
        });

        // 4. Update Registration with Session ID
        await db.update(registrations)
            .set({ stripeCheckoutSessionId: session.id })
            .where(eq(registrations.id, regId));

        // 5. Return URL to frontend
        res.json({ url: session.url });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to initiate checkout' });
    }
});

// POST /api/registrations/verify
// Called by frontend on /success page to confirm payment
registrationRoutes.post('/verify', async (req, res) => {
    const { sessionId } = req.body;

    try {
        // 1. Retrieve Session from Stripe to be safe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            // 2. Mark as paid in DB
            const regId = session.metadata?.registrationId;
            if (regId) {
                const updatedReg = await db.update(registrations)
                    .set({
                        paymentStatus: 'paid',
                        stripePaymentIntentId: session.payment_intent as string,
                        paidAt: new Date(),
                    })
                    .where(eq(registrations.id, parseInt(regId)))
                    .returning();

                // Fetch team name for the receipt display
                const team = await db.query.teams.findFirst({
                    where: eq(teams.id, updatedReg[0].teamId as number)
                });

                return res.json({
                    status: 'paid',
                    registration: {
                        ...updatedReg[0],
                        teamName: team?.name || 'Unknown Team'
                    }
                });
            }
        }

        res.json({ status: session.payment_status });

    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});
