import { db } from './db';
import { teams, registrations, siteContent } from './db/schema';
import { sql } from 'drizzle-orm';

const SEED_TEAMS = [
    // Boys
    {
        name: '2018 Boys',
        priceCents: 16000,
        capacity: 12,
        description: '• For boys born between January 1st, 2018 and December 31st, 2018\n\n• 7v7 Format'
    },
    {
        name: '2017 Boys',
        priceCents: 300, // $3.00 for testing
        capacity: 12,
        description: '• For boys born between January 1st, 2017 and December 31st, 2017\n\n• 7v7 Format'
    },
    {
        name: '2016 Boys',
        priceCents: 16000,
        capacity: 12,
        description: '• For boys born between January 1st, 2016 and December 31st, 2016\n\n• 7v7 Format'
    },
    {
        name: '2014 & 2015 Boys',
        priceCents: 16000,
        capacity: 16,
        description: '• For boys born between January 1st, 2014 and December 31st, 2015\n\n• 9v9 Format\n\n• If enough players register, we will split into separate 2014 and 2015 teams.'
    },
    {
        name: '2012 & 2013 Boys',
        priceCents: 16000,
        capacity: 22,
        description: '• For boys born between January 1st, 2012 and December 31st, 2013\n\n• 11v11 Format\n\n• If enough players register, we will split into separate 2012 and 2013 teams.'
    },

    // Girls
    {
        name: '2018 Girls',
        priceCents: 16000,
        capacity: 12,
        description: '• For girls born between January 1st, 2018 and December 31st, 2018\n\n• 7v7 Format'
    },
    {
        name: '2017 Girls',
        priceCents: 300, // $3.00 for testing
        capacity: 12,
        description: '• For girls born between January 1st, 2017 and December 31st, 2017\n\n• 7v7 Format'
    },
    {
        name: '2016 Girls',
        priceCents: 16000,
        capacity: 12,
        description: '• For girls born between January 1st, 2016 and December 31st, 2016\n\n• 7v7 Format'
    },
    {
        name: '2014 & 2015 Girls',
        priceCents: 16000,
        capacity: 16,
        description: '• For girls born between January 1st, 2014 and December 31st, 2015\n\n• 9v9 Format\n\n• If enough players register, we will split into separate 2014 and 2015 teams.'
    },
    {
        name: '2012 & 2013 Girls',
        priceCents: 16000,
        capacity: 22,
        description: '• For girls born between January 1st, 2012 and December 31st, 2013\n\n• 11v11 Format\n\n• If enough players register, we will split into separate 2012 and 2013 teams.'
    },
];

const DEFAULT_CONTENT = {
    program_header: "About",
    program_body: `Cavalry FC is a youth soccer program where kids of all ages and experience levels play soccer with their South Arbor peers on organized teams. Cavalry FC competes in the recreational division of the WSSL, with an emphasis on development, teamwork, and enjoyment of the game.`,
    seasonal_fee: "Seasonal Fee: $160 per player by January 31st, $200 after.",
    schedule_header: "Schedule",
    schedule_body: `Practices begin the week of March 16th (weather permitting) and are held 1–2 times per week on weekday afternoons or evenings at South Arbor or Wall Park. Times are coordinated by coaches in partnership with parents.\n\nGames begin weekend of March 28th. Typically played on weekends (occasional weekday evenings). Teams play 8 games total. Final game date is Saturday, June 7th.`,
    coaches_header: "Coaches & Info",
    coaches_body: `Coaches: Teams are led by volunteer parents. All coaches complete background checks and safety training as required by U.S. Soccer. Interested? Indicate it on the form!\n\nRefunds: If a team does not receive sufficient registrations, we will attempt to combine teams or process full refunds.`
};

async function seed() {
    console.log('Seeding teams...');
    try {
        // Clear existing data to avoid duplicates/conflicts
        await db.delete(registrations);
        await db.delete(teams);
        // We do NOT delete site_content to preserve edits, but we insert if missing.
        // Actually, for this specific run, let's upsert to ensure the "Default" text is there as requested.
        // The user said "upload it to database", implying they want this default text now.

        // Reset ID counters
        await db.execute(sql`ALTER SEQUENCE teams_id_seq RESTART WITH 1`);
        await db.execute(sql`ALTER SEQUENCE registrations_id_seq RESTART WITH 1`);

        const result = await db.insert(teams).values(SEED_TEAMS).returning();
        console.log('Seeded:', result.length, 'teams');

        // Upsert Site Content
        await db.insert(siteContent).values({
            key: 'home_info',
            content: DEFAULT_CONTENT
        }).onConflictDoUpdate({
            target: siteContent.key,
            set: { content: DEFAULT_CONTENT }
        });
        console.log('Seeded: site_content (home_info)');

    } catch (error) {
        console.error('Error seeding:', error);
    }
    process.exit(0);
}

seed();
