import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { donations } from '../db/schema';
import { eq } from 'drizzle-orm';
import { desc } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

export const donationRoutes = Router();

const checkAdmin = (req: any, res: any, next: any) => {
    const password = req.headers['x-admin-password'];
    if (password === process.env.ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// POST /api/donations/checkout
donationRoutes.post('/checkout', async (req, res) => {
    const { amountCents, donorName, donorEmail, comment, type } = req.body;

    const recordType = type === 'reimbursement' ? 'reimbursement' : 'donation';
    const isReimbursement = recordType === 'reimbursement';

    try {
        if (!amountCents || amountCents < 100) {
            return res.status(400).json({ error: 'Minimum amount is $1.00' });
        }

        // 1. Create unpaid record
        const newDonation = await db.insert(donations).values({
            type: recordType,
            donorName: donorName || null,
            donorEmail: donorEmail || null,
            comment: comment || null,
            amountCents,
            paymentStatus: 'unpaid',
        }).returning();

        const donationId = newDonation[0].id;

        // 2. Create Stripe Checkout Session
        const returnPath = isReimbursement ? '/reimburse' : '/donate';
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            ...(donorEmail ? { customer_email: donorEmail } : {}),
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: isReimbursement
                                ? 'Cavalry FC Booster Club — Reimbursement'
                                : 'Donation to Cavalry FC Booster Club',
                            description: isReimbursement
                                ? (comment || 'Cash reimbursement payment')
                                : (comment ? `Message: ${comment}` : 'Thank you for your support!'),
                        },
                        unit_amount: amountCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${FRONTEND_URL}${returnPath}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}${returnPath}?canceled=true`,
            metadata: {
                donationId: donationId.toString(),
            },
        });

        // 3. Update donation with session ID
        await db.update(donations)
            .set({ stripeCheckoutSessionId: session.id })
            .where(eq(donations.id, donationId));

        // 4. Return URL to frontend
        res.json({ url: session.url });

    } catch (error) {
        console.error('Donation checkout error:', error);
        res.status(500).json({ error: 'Failed to initiate donation checkout' });
    }
});

// POST /api/donations/verify
donationRoutes.post('/verify', async (req, res) => {
    const { sessionId } = req.body;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const donationId = session.metadata?.donationId;
            if (donationId) {
                const updated = await db.update(donations)
                    .set({
                        paymentStatus: 'paid',
                        stripePaymentIntentId: session.payment_intent as string,
                        paidAt: new Date(),
                    })
                    .where(eq(donations.id, parseInt(donationId)))
                    .returning();

                return res.json({
                    status: 'paid',
                    donation: updated[0],
                });
            }
        }

        res.json({ status: session.payment_status });

    } catch (error) {
        console.error('Donation verify error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// GET /api/donations (Admin)
donationRoutes.get('/', checkAdmin, async (req, res) => {
    try {
        const all = await db.query.donations.findMany({
            orderBy: [desc(donations.createdAt)],
        });
        res.json(all);
    } catch (error) {
        console.error('Donations list error:', error);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
});
