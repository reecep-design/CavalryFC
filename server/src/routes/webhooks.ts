import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { registrations } from '../db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

export const webhookRoutes = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia', // Approximated version
});

// POST /api/webhooks/stripe
webhookRoutes.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret || !sig) {
        console.error('Stripe secret or signature missing');
        return res.sendStatus(400);
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('Payment successful for session:', session.id);

            // Update registration status
            if (session.metadata?.registrationId) {
                await db.update(registrations)
                    .set({
                        paymentStatus: 'paid',
                        stripePaymentIntentId: session.payment_intent as string,
                        paidAt: new Date(),
                    })
                    .where(eq(registrations.id, parseInt(session.metadata.registrationId)));
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
});

import express from 'express'; // Need this for express.raw type usage
