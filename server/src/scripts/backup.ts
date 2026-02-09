import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const backupDir = path.resolve(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `backup-${timestamp}.sql`;
const filepath = path.join(backupDir, filename);

console.log(`Backing up database to ${filepath}...`);

try {
    execSync(`pg_dump "${DATABASE_URL}" > "${filepath}"`, { stdio: 'inherit' });
    console.log(`Backup complete: ${filepath}`);
} catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
}
