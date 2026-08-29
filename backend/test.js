async function test() {
  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sathurshna@gmail.com',
        password: 'password123'
      })
    });
    const loginData = await res.json();
    
    if (!loginData.data?.accessToken) {
      console.log('Login failed', loginData);
      return;
    }
    const token = loginData.data.accessToken;
    console.log('Got token');
    
    const eventsRes = await fetch('http://localhost:4000/api/events?limit=20&category=all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const eventsData = await eventsRes.json();
    console.log('Events:', JSON.stringify(eventsData, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
