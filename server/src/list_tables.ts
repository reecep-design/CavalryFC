import { db } from './db';
import { sql } from 'drizzle-orm';

async function listTables() {
    try {
        const result = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables found:', result.rows.map(r => r.table_name));
    } catch (e) {
        console.error('Error listing tables:', e);
    }
    process.exit(0);
}

listTables();
