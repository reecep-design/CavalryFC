import { db } from './db';

async function checkTeams() {
    try {
        const teams = await db.query.teams.findMany();
        console.log('Total Teams Found:', teams.length);
        teams.forEach(t => console.log(`- ${t.name}`));
    } catch (e) {
        console.error('Error fetching teams:', e);
    }
    process.exit(0);
}

checkTeams();
