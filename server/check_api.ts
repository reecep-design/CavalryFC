
// Using global fetch (Node 18+)

async function check() {
    try {
        const res = await fetch('http://localhost:3000/api/teams');
        if (!res.ok) {
            console.log('Status:', res.status);
            console.log('Text:', await res.text());
        } else {
            const json = await res.json();
            console.log('Teams count:', Array.isArray(json) ? json.length : 'Not array');
            if (Array.isArray(json) && json.length > 0) {
                console.log('Sample:', JSON.stringify(json[0]));
            } else {
                console.log('Full JSON:', JSON.stringify(json, null, 2));
            }
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

check();
