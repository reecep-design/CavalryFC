import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

console.log('--- DIAGNOSTICS ---');

// 1. Read raw file
const envPath = path.resolve(process.cwd(), '.env');
console.log('Looking for .env at:', envPath);

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/DATABASE_URL=(.*)/);
    if (match) {
        console.log('FILE CONTENT VALUE:', match[1].substring(0, 50) + '...');
    } else {
        console.log('FILE CONTENT: DATABASE_URL not found in file');
    }
} else {
    console.log('FILE CONTENT: .env file DOES NOT EXIST at path');
}

// 2. Check process.env BEFORE loading
console.log('PROCESS.ENV (Pre-load):', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'undefined');

// 3. Force load
const result = dotenv.config({ override: true }); // override existing vars
if (result.error) {
    console.log('DOTENV ERROR:', result.error);
}

// 4. Check process.env AFTER loading
console.log('PROCESS.ENV (Post-load):', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'undefined');
