import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, EMAIL, PASSWORD } from './constants.js';

export function authenticateAndGetCrumb() {
    const authRes = http.post(`${BASE_URL}/j_spring_security_check`, {
        j_username: EMAIL,
        j_password: PASSWORD
    }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }); // login attempt. If correct, session cookie (JSESSIONID) is returned

    if (authRes.status !== 302) {
        throw new Error(`STATUS ${authRes.status}`);
    }

    const cookies = http.cookieJar().cookiesForURL(BASE_URL);   // the cookieJar keeps track of cookies sent by servers  
    const sessionCookie = cookies.JSESSIONID;   // the cookie proves that you are logged in. It is used to authenticate your requests.

    if (!sessionCookie) {
        throw new Error('No session cookie received after authentication');
    }

    const crumbRes = http.get(`${BASE_URL}/crumbIssuer/api/json`, {
        headers: {
            'Cookie': `JSESSIONID=${sessionCookie}`
        }
    }); // get crumb. It's a csrf token which protects what you do after login from malicious actions.

    if (crumbRes.status !== 200) {
        throw new Error(`Failed to get crumb with status ${crumbRes.status}`);
    }

    try {
        const crumbData = JSON.parse(typeof crumbRes.body === 'string' ? crumbRes.body : '');
        return {
            crumb: crumbData.crumb,
            crumbHeader: crumbData.crumbRequestField || 'Jenkins-Crumb',
            sessionCookie: sessionCookie
        };  // When you log in, the server gives you a crumb. For every state-changing request (POST/PUT/DELETE), you must add the crumb as a header (e.g. Jenkins-Crumb: abc123). Then the Server checks: Does the crumb match your session?
    } catch (e) {
        throw new Error('Failed to parse crumb response');
    }
}

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}



