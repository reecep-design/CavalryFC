
import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        await db.execute(sql`DROP TABLE IF EXISTS registrations CASCADE`);
        console.log('Dropped registrations table.');
    } catch (err) {
        console.error('Error dropping table:', err);
    }
    process.exit(0);
}

main();
