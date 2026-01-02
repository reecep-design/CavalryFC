
import { db } from './src/db';

async function main() {
    const teams = await db.query.teams.findMany();
    console.log('Teams found:', teams.length);
    console.log(JSON.stringify(teams, null, 2));
    process.exit(0);
}

main().catch(console.error);
