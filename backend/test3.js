const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
  { userId: '671828e9-f8ba-4b5c-9de0-efffb9db27d1', email: 'sathurshna@gmail.com' },
  process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_eventmgmt_2026',
  { expiresIn: '15m' }
);

async function test() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:4000/api' });
    api.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const [eventsRes, statsRes] = await Promise.all([
      api.get(`/events?limit=20&category=all`),
      api.get('/events/stats')
    ]);

    console.log('Events length:', eventsRes.data.data.length);
    console.log('Stats:', statsRes.data.data);
  } catch (error) {
    console.error('Error in Axios:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

test();
