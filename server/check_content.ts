
import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        const result = await db.execute(sql`SELECT * FROM site_content`);
        console.log('Rows in site_content:', result.rows.length);
        console.log('Data:', result.rows);
    } catch (err) {
        console.log('Error checking site_content:', err.message);
    }
    process.exit(0);
}

main();
