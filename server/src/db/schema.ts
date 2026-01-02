import { pgTable, serial, text, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const experienceLevelEnum = pgEnum('experience_level', ['New', 'Some', 'Experienced']);
export const uniformSizeEnum = pgEnum('uniform_size', ['YS', 'YM', 'YL', 'AS', 'AM', 'AL', 'AXL']);
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'paid', 'refunded', 'canceled']);

export const teams = pgTable('teams', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(), // e.g. "2017 Boys"
    priceCents: integer('price_cents').notNull().default(16000),
    capacity: integer('capacity').notNull().default(20),
    description: text('description'),
    open: boolean('open').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

export const registrations = pgTable('registrations', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').references(() => teams.id),

    // Player
    playerFirstName: text('player_first_name').notNull(),
    playerLastName: text('player_last_name').notNull(),
    dateOfBirth: text('date_of_birth').notNull(), // YYYY-MM-DD
    schoolGrade: text('school_grade'),
    primaryPosition: text('primary_position'),
    experienceLevel: experienceLevelEnum('experience_level'),
    medicalNotes: text('medical_notes'),

    // Uniform
    jerseySize: uniformSizeEnum('jersey_size'),
    shortSize: uniformSizeEnum('short_size'),

    // Guardian 1
    guardian1FirstName: text('guardian_1_first_name').notNull(),
    guardian1LastName: text('guardian_1_last_name').notNull(),
    guardian1Email: text('guardian_1_email').notNull(),
    guardian1Phone: text('guardian_1_phone').notNull(),
    guardian1Volunteer: text('guardian_1_volunteer').default('No'), // Yes, No, Maybe

    // Guardian 2 (Optional)
    guardian2FirstName: text('guardian_2_first_name'),
    guardian2LastName: text('guardian_2_last_name'),
    guardian2Email: text('guardian_2_email'),
    guardian2Phone: text('guardian_2_phone'),
    guardian2Volunteer: text('guardian_2_volunteer').default('No'), // Yes, No, Maybe

    // Emergency Contact
    emergencyContactFirstName: text('emergency_contact_first_name'),
    emergencyContactLastName: text('emergency_contact_last_name'),
    emergencyContactEmail: text('emergency_contact_email'),
    emergencyContactPhone: text('emergency_contact_phone'),
    emergencyContactRelation: text('emergency_contact_relation'),

    // Player Extra
    scheduleRequests: text('schedule_requests'),

    // Address
    street1: text('street_1').notNull(),
    street2: text('street_2'),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zip: text('zip').notNull(),

    // Consents
    waiverAccepted: boolean('waiver_accepted').notNull().default(false), // Injury/Liability
    photoReleaseAccepted: boolean('photo_release_accepted').notNull().default(false), // Photos
    ageVerificationAccepted: boolean('age_verification_accepted').notNull().default(false), // Birth date attestation
    codeOfConductAccepted: boolean('code_of_conduct_accepted').notNull().default(false),

    // Payment
    amountCents: integer('amount_cents'),
    currency: text('currency').default('usd'),
    stripeCheckoutSessionId: text('stripe_checkout_session_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    paymentStatus: paymentStatusEnum('payment_status').default('unpaid'),
    isWaitlist: boolean('is_waitlist').default(false),
    paidAt: timestamp('paid_at'),

    createdAt: timestamp('created_at').defaultNow(),
});

export const siteContent = pgTable('site_content', {
    key: text('key').primaryKey(),
    content: jsonb('content').notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
