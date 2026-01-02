
import { db } from './src/db';

async function main() {
    try {
        const regs = await db.query.registrations.findMany();
        console.log('Registrations found:', regs.length);
    } catch (err) {
        console.error('Failed to fetch registrations:', err);
    }
    process.exit(0);
}

main();
