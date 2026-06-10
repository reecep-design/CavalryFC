/**
 * Set up the Fall 2026 season under the new U.S. Soccer school-year alignment
 * (age brackets run Aug 1 – Jul 31).
 *
 * It:
 *   1. Archives every current ACTIVE team (kept for records, hidden from the public homepage).
 *      Old registrations stay attached to those archived teams and are never touched.
 *   2. Creates the new format-based teams below (Boys + Girls for each), with the
 *      Fall 2026 pricing ladder: $100 super early bird -> $120 early bird -> $150 regular.
 *
 * DRY RUN by default — prints what it would do and changes nothing.
 * Add --apply to actually write to the database.
 *
 * Usage:
 *   npm run db:backup                          # ALWAYS back up first
 *   tsx src/scripts/setup-fall-2026.ts         # preview
 *   tsx src/scripts/setup-fall-2026.ts --apply # commit
 */
import { db } from '../db';
import { teams } from '../db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

const APPLY = process.argv.includes('--apply');

// Pricing ladder (cents) and tier deadlines.
// Deadlines are pinned to MIDNIGHT EASTERN (-04:00 EDT) so the price flips at the
// start of the named day in the club's local time, regardless of server timezone:
//   $100 through Jun 15  ->  $120 through Jul 31  ->  $150 from Aug 1.
const SUPER_CENTS = 10000;   // $100 super early bird
const EARLY_CENTS = 12000;   // $120 early bird
const REGULAR_CENTS = 15000; // $150 regular
const SUPER_ENDS = new Date('2026-06-16T00:00:00-04:00'); // $100 through end of Jun 15 ET
const EARLY_ENDS = new Date('2026-08-01T00:00:00-04:00'); // $120 through end of Jul 31 ET

// Age brackets for 2026-27 (Aug 1 – Jul 31 windows). Listed youngest-first so they
// display in that order on the homepage.
const BRACKETS = [
    { ageLabel: 'U9/U10', format: '7v7', born: 'Aug 1, 2016 – Jul 31, 2018', ball: 4, capacity: 12 },
    { ageLabel: 'U11/U12', format: '9v9', born: 'Aug 1, 2014 – Jul 31, 2016', ball: 4, capacity: 16 },
    { ageLabel: 'U13/U14', format: '11v11', born: 'Aug 1, 2012 – Jul 31, 2014', ball: 5, capacity: 18 },
];
const GENDERS = ['Boys', 'Girls'] as const;

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

function buildNewTeams() {
    const list: { name: string; description: string; capacity: number }[] = [];
    for (const b of BRACKETS) {
        for (const gender of GENDERS) {
            list.push({
                name: `${b.ageLabel} ${gender}`,
                description: `• For ${gender.toLowerCase()} born ${b.born} (${b.ageLabel})\n• ${b.format} format\n• Size ${b.ball} ball`,
                capacity: b.capacity,
            });
        }
    }
    return list;
}

async function main() {
    const allTeams = await db.query.teams.findMany();
    const active = allTeams.filter(t => !t.archived);
    const newTeams = buildNewTeams();
    const existingNames = new Set(allTeams.map(t => t.name));

    console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN'} — Fall 2026 season setup`);
    console.log(`Pricing (Eastern): ${money(SUPER_CENTS)} through Jun 15  →  ${money(EARLY_CENTS)} through Jul 31  →  ${money(REGULAR_CENTS)} from Aug 1\n`);

    console.log(`Will ARCHIVE ${active.length} current team(s):`);
    active.forEach(t => console.log(`   #${t.id}  "${t.name}"`));

    console.log(`\nWill CREATE ${newTeams.length} new team(s):`);
    newTeams.forEach(t => console.log(`   "${t.name}"  (cap ${t.capacity})`));

    // Warn if any new names already exist (likely a double run)
    const collisions = newTeams.filter(t => existingNames.has(t.name));
    if (collisions.length > 0) {
        console.warn(`\nWARNING: these names already exist — possible double run:`);
        collisions.forEach(c => console.warn(`   "${c.name}"`));
    }

    if (!APPLY) {
        console.log(`\nDry run only. Re-run with --apply to commit.\n`);
        process.exit(0);
    }

    // 1. Archive all current active teams
    for (const t of active) {
        await db.update(teams).set({ archived: true, open: false }).where(eq(teams.id, t.id));
        console.log(`  Archived "${t.name}" (#${t.id})`);
    }

    // 2. Create the new format-based teams
    for (const t of newTeams) {
        const created = await db.insert(teams).values({
            name: t.name,
            description: t.description,
            capacity: t.capacity,
            priceCents: REGULAR_CENTS,
            superEarlyBirdPriceCents: SUPER_CENTS,
            superEarlyBirdEnds: SUPER_ENDS,
            earlyBirdPriceCents: EARLY_CENTS,
            earlyBirdEnds: EARLY_ENDS,
            open: true,
            archived: false,
        }).returning();
        console.log(`  Created "${created[0].name}" (#${created[0].id})`);
    }

    console.log(`\nDone. ${active.length} archived, ${newTeams.length} created.\n`);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
