import http from 'k6/http';
import { check } from 'k6';

const scenario = __ENV.SCENARIO;
const AVG_DAILY_USERS = 100;
export const options = {
  scenarios:
    scenario === 'signup'
  ? {
      signup_test: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '30s', target: AVG_DAILY_USERS/2 },  // ramp-up to 10 users
          { duration: '1m', target: AVG_DAILY_USERS/2 },   // stay at 10 users
          { duration: '15s', target: 0 },   // ramp-down to 0
        ],
        exec: 'signupOnly',
      },
    }
  : scenario === 'signin'
  ? {
      signin_test: {
        executor: 'constant-arrival-rate',
        rate: 50,                          // 50 iterations per second
        timeUnit: '1s',
        duration: '2m',
        preAllocatedVUs: 100,
        maxVUs: 500,
        exec: 'signinOnly',
      },
    }
  : scenario === 'traffic'
  ? {
      traffic_test: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '1m', target: AVG_DAILY_USERS },   
          { duration: '2m', target: AVG_DAILY_USERS },   
          { duration: '30s', target: 0 },   
        ],
        exec: 'trafficRequestTest',
      },
    }
  : {},
};

const BASE_URL = 'http://localhost:8080';
const email = 'mohamedzakariaali@gmail.com';
const password = 'Mhdzikoo@123';

export function signupOnly() {
  const randomId = uuidv4();
  const randomEmail = `user_${randomId}@example.com`;
  const randomPassword = `Pass_${randomId}`;

  const signupUrl = `${BASE_URL}/api/users/create`;
  const signupPayload = JSON.stringify({
    firstName: 'Joe',
    lastName: 'Ahmed',
    username: `user_${randomId}`,
    gender: 'Male',
    dob: '2002-04-26',
    email: randomEmail,
    password: randomPassword,
  });

  const signupParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const signupRes = http.post(signupUrl, signupPayload, signupParams);

  check(signupRes, {
    'signup status was 201 or 200': (r) => r.status === 201 || r.status === 200,
  });
}

export function signinOnly() {
  const signinUrl = `${BASE_URL}/api/users/signin/email`;
  const signinPayload = JSON.stringify({ email, password });

  const signinParams = {
    headers: { 'Content-Type': 'application/json' },
  };

  const signinRes = http.post(signinUrl, signinPayload, signinParams);

  check(signinRes, {
    'signin status was 200': (r) => r.status === 200,
  });
}


export function trafficRequestTest() {
  const signinUrl = `${BASE_URL}/api/users/signin/email`;
  const signinPayload = JSON.stringify({ email, password });
  const signinRes = http.post(signinUrl, signinPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const rawToken = signinRes.json('accessToken');
if (typeof rawToken !== 'string') {
  throw new Error(`Expected accessToken to be a string, but got: ${typeof rawToken}`);
}
const token = rawToken;
  check(signinRes, {
    'signin succeeded': (r) => r.status === 200 && !!token,
  });

  const trafficRes = http.get(`${BASE_URL}/api/sensors/traffic`, {
    headers: {
      accessToken: token,
    },
  });

  console.log('Traffic response:', trafficRes.body);

  check(trafficRes, {
    'traffic request status is 200': (r) => r.status === 200,
  });
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}