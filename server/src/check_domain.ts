import https from 'https';

console.log('Checking https://cavalryfc.org...');

const req = https.request('https://cavalryfc.org', { method: 'HEAD' }, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS:`, res.headers);
});

req.on('error', (e) => {
    console.error(`ERROR: ${e.message}`);
});

req.end();
