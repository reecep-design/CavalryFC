import dotenv from 'dotenv';
dotenv.config();

try {
    const urlStr = process.env.DATABASE_URL;
    if (!urlStr) {
        console.log('RESULT: DATABASE_URL_MISSING');
    } else {
        const url = new URL(urlStr);
        console.log(`RESULT: HOST=${url.hostname}`);
        console.log(`RESULT: DB=${url.pathname.substring(1)}`); // remove leading /
    }
} catch (e) {
    console.log('RESULT: ERROR_PARSING_URL');
    console.log(process.env.DATABASE_URL); // Fallback to printing it if valid
}
