/**
 * Update the homepage info box (site_content key "home_info") for Fall 2026.
 * Keeps the program/coaches text; refreshes the fee + schedule for the new season.
 *
 *   tsx src/scripts/update-content-fall-2026.ts
 */
import { db } from '../db';
import { siteContent } from '../db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const existing = await db.select().from(siteContent).where(eq(siteContent.key, 'home_info')).limit(1);
    const current: any = existing.length > 0 ? existing[0].content : {};

    const content = {
        ...current,
        seasonal_fee: 'Registration: $100 early bird through June 15 → $120 through July 31 → $150 after',
        schedule_body:
            'Practices are held 1–2 times per week at South Arbor or Wall Park. Each team’s practice schedule is set in collaboration with that team’s coaches and parents.\n\nGames are played on weekends — Saturdays and Sundays, depending on the schedule.',
    };

    await db.insert(siteContent)
        .values({ key: 'home_info', content })
        .onConflictDoUpdate({ target: siteContent.key, set: { content, updatedAt: new Date() } });

    console.log('Updated home_info content:');
    console.log('  seasonal_fee :', content.seasonal_fee);
    console.log('  schedule_body:\n' + content.schedule_body.split('\n').map((l: string) => '    ' + l).join('\n'));
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
