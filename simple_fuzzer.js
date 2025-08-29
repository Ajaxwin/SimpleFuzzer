const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:80';
const NUM_TESTS = 1000;
const LOG_FILE = 'fuzzing_results.txt';

// Payload generators
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateRegexPayloads() {
    return [
        '.*',
        '(a+)+b',  // ReDoS payload
        '[a-zA-Z0-9]{100}',
        '\\w+@\\w+\\.\\w+',
        generateRandomString(50),
        '(x+x+)+y',  // Another ReDoS payload
        '\\d{1000}',
        JSON.stringify({ key: 'value' }), // JSON in a string
        '\\',        // Unescaped backslash
        '(',         // Unclosed parenthesis
        ')'          // Unopened parenthesis
    ];
}

function generateUserPayloads() {
    return [
        {},
        { username: null, email: null },
        { username: '', email: '' },
        { username: generateRandomString(10000), email: 'test@example.com' },
        { username: 'valid', email: generateRandomString(10000) },
        { username: '<script>alert(1)</script>', email: 'test@example.com' },
        { username: 'valid', email: '<script>alert(1)</script>' },
        { username: { nested: 'object' }, email: 'test@example.com' },
        { username: 'valid', email: { nested: 'object' } },
        { username: 'valid', email: 'test@example.com', extraField: 'should be ignored' },
        { username: 'valid', email: 'test@example.com'.repeat(100) }
    ];
}

// Fuzz the search endpoint
async function fuzzSearchEndpoint() {
    const payloads = generateRegexPayloads();
    const results = [];

    for (const payload of payloads) {
        try {
            // console.log(`Testing search with: ${payload}`);
            const startTime = Date.now();
            const response = await axios.get(`${BASE_URL}/search`, {
                params: { q: payload },
                timeout: 5000 // 5 second timeout
            });
            const endTime = Date.now();

            // @ no error
            //  results.push({
            //    payload,
            //    statusCode: response.status,
            //    responseTime: endTime - startTime,
            //    responseSize: JSON.stringify(response.data).length,
            //    error: null
            //  });
        } catch (error) {
            results.push({
                payload,
                statusCode: error.response?.status || 0,
                responseTime: 0,
                responseSize: 0,
                error: error.message
            });
        }
    }

    return results;
}

// Fuzz the user creation endpoint
async function fuzzUserCreationEndpoint() {
    const payloads = generateUserPayloads();
    const results = [];

    for (const payload of payloads) {
        try {
            // console.log(`Testing user creation with: ${JSON.stringify(payload)}`);
            const startTime = Date.now();
            const response = await axios.post(`${BASE_URL}/users`, payload, {
                timeout: 5000 // 5 second timeout
            });
            const endTime = Date.now();

            // @ no error
            //  results.push({
            //    payload: JSON.stringify(payload),
            //    statusCode: response.status,
            //    responseTime: endTime - startTime,
            //    responseSize: JSON.stringify(response.data).length,
            //    error: null
            //  });
        } catch (error) {
            // ! error
            results.push({
                payload: JSON.stringify(payload),
                statusCode: error.response?.status || 0,
                responseTime: 0,
                responseSize: 0,
                error: error.message
            });
        }
    }

    return results;
}

// Main fuzzing function
async function runFuzzing() {
    console.log('Starting API fuzzing...');

    // Fuzz both endpoints
    const searchResults = await fuzzSearchEndpoint();
    const userResults = await fuzzUserCreationEndpoint();

    // Log results
    const allResults = [...searchResults, ...userResults];
    fs.writeFileSync(LOG_FILE, JSON.stringify(allResults, null, 2));

    // Print summary
    console.log('\nFuzzing completed!');
    console.log(`Total tests: ${allResults.length}`);

    const errors = allResults.filter(r => r.error !== null);
    console.log(`Tests with errors: ${errors.length}`);

    const slowResponses = allResults.filter(r => r.responseTime > 1000);
    console.log(`Slow responses (>1s): ${slowResponses.length}`);

    // if (errors.length > 0) {
    //     console.log('\nSample errors:');
    //     errors.slice(0, 5).forEach(e => {
    //         console.log(`- Payload: ${e.payload}, Error: ${e.error}`);
    //     });
    // }

    console.log(`\nDetailed results saved to ${LOG_FILE}`);
}

// Run the fuzzer
runFuzzing().catch(console.error);
