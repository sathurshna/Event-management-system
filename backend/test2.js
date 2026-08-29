const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
  { userId: '671828e9-f8ba-4b5c-9de0-efffb9db27d1', email: 'sathurshna@gmail.com' },
  process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_eventmgmt_2026',
  { expiresIn: '15m' }
);

async function test() {
  const eventsRes = await fetch('http://localhost:4000/api/events?limit=20&category=all', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const eventsData = await eventsRes.json();
  console.log('Events:', JSON.stringify(eventsData, null, 2));
  
  const statsRes = await fetch('http://localhost:4000/api/events/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const statsData = await statsRes.json();
  console.log('Stats:', JSON.stringify(statsData, null, 2));
}

test();
