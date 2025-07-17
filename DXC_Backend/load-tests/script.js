import http from 'k6/http';
import { check, sleep } from 'k6';
import { authenticateAndGetCrumb, uuidv4 } from './utils.js';
import { ACCESS_TOKEN, BASE_URL, EMAIL, PASSWORD } from './constants.js';

const AVG_DAILY_VISITORS = 50

export const options = {
    scenarios: {
        // Baseline load test for sign-up (normal traffic pattern)
        signup_load: {
            executor: 'ramping-vus',
            stages: [
                { duration: '30s', target: AVG_DAILY_VISITORS / 2 },
                { duration: '1m', target: AVG_DAILY_VISITORS / 2 },
                { duration: '30s', target: 0 },
            ],
            exec: 'signup',
        },
        signup_spike: {
            executor: 'ramping-vus',
            stages: [
                { duration: '10s', target: 0 },     
                { duration: '1m', target: 2000 },   // Sudden surge (e.g., 2K VUs)
                { duration: '5m', target: 2000 },   // Hold to test stability. Some problems (memory leaks database connection exhaustion, throttling) only appear after running at high load for an extended period.
                { duration: '30s', target: 0 },     
            ],
            exec: 'signup',
        },

        // Stress test for sign-in (handles high frequency requests)
        signin_stress: {
            executor: 'constant-arrival-rate',
            rate: 500,               // 500 requests per second
            timeUnit: '1s',
            duration: '2m',
            preAllocatedVUs: 100,      // Start with 100 VUs
            maxVUs: 500,              // Scale up to 500 if needed
            exec: 'signin',
        },
        // Spike test for sign-in (simulates traffic bursts)
        signin_spike: {
            executor: 'ramping-vus',
            stages: [
                { duration: '10s', target: 0 },
                { duration: '5s', target: 1000 },  // Sudden spike to 1000 VUs
                { duration: '1m', target: 1000 },  // Sustain spike. Some problems (memory leaks, database connection exhaustion, throttling) only appear after running at high load for an extended period. Also, holding it for Real-world traffic simulation
                { duration: '10s', target: 0 },
            ],
            exec: 'signin',
        },

        traffic_dashboard: {
            executor: 'ramping-vus',
            stages: [
                { duration: '30s', target: AVG_DAILY_VISITORS * 3 },
                { duration: '2m', target: AVG_DAILY_VISITORS * 3 },
                { duration: '30s', target: 0 },
            ],
        },
    },
};

export function signup() {
    const { crumb, crumbHeader, sessionCookie } = authenticateAndGetCrumb();
    const randomId = uuidv4();
    const randomEmail = `user_${randomId}@example.com`;
    const randomPassword = `Pass_${randomId}`;
    const signupUrl = `${BASE_URL}/api/users/create`;
    const signupPayload = JSON.stringify({
        firstName: "Joe",
        lastName: "Ahmed",
        username: `user_${randomId}`,
        gender: "Male",
        dob: "2002-04-26",
        email: randomEmail,
        password: randomPassword
    });

    const signupParams = {
        headers: {
            'Content-Type': 'application/json',
            [crumbHeader]: crumb,
            'Cookie': `JSESSIONID=${sessionCookie}`
        },
    };
    const signupRes = http.post(signupUrl, signupPayload, signupParams);

    check(signupRes, {
        'signup status was 201': (r) => r.status === 201 || r.status === 200,

    });
}

export function signin() {
    const { crumb, crumbHeader, sessionCookie } = authenticateAndGetCrumb();
    const signinUrl = `${BASE_URL}/api/users/signin/email`;
    const signinPayload = JSON.stringify({
        email: EMAIL,
        password: PASSWORD
    });

    const signinParams = {
        headers: {
            'Content-Type': 'application/json',
            [crumbHeader]: crumb,
            'Cookie': `JSESSIONID=${sessionCookie}`
        },
    };

    const signinRes = http.post(signinUrl, signinPayload, signinParams);

    check(signinRes, {
        'signin status was 200': (r) => r.status === 200,
        'login returned token': (r) => {
            let bodyStr = typeof r.body === 'string' ? r.body : (r.body ? String.fromCharCode.apply(null, new Uint8Array(r.body)) : '');
            const body = JSON.parse(bodyStr);
            return body.accessToken !== undefined;
        }
    });
}

const SENSOR_ENDPOINTS = [
    '/api/sensors/traffic',
    // '/api/sensors/air-pollution-sensors',
    // '/api/sensors/street_light'
];
export default function () {
    const endpoint = SENSOR_ENDPOINTS[__VU % SENSOR_ENDPOINTS.length]; // Distribute VUs evenly
    const { crumb, crumbHeader, sessionCookie } = authenticateAndGetCrumb();

    const res = http.get(`${BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            [crumbHeader]: crumb,
            'Cookie': `JSESSIONID=${sessionCookie}`,
            'accessToken': ACCESS_TOKEN,
        },
    });

    // Shared validation (customize per sensor if needed)
    check(res, {
        [`${endpoint} status 200`]: (r) => r.status === 200,
        [`${endpoint} valid JSON`]: (r) => {
            let bodyStr = typeof r.body === 'string' ? r.body : (r.body ? String.fromCharCode.apply(null, new Uint8Array(r.body)) : '');
            try {
                const body = JSON.parse(bodyStr);
                return body.content?.length > 0;
            } catch (e) {
                return false;
            }
        },
    });
}