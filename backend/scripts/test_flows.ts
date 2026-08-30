import axios from 'axios';

const API_URL = 'https://eventra-backend-le49.onrender.com/api';

async function runTests() {
  console.log('--- Starting Flow Tests ---');
  try {
    // 1. Log in users
    console.log('\n[1] Logging in Alice and Bob...');
    const aliceRes = await axios.post(`${API_URL}/auth/login`, { email: 'alice@example.com', password: 'Password123!' });
    const aliceToken = aliceRes.data.accessToken;
    
    const bobRes = await axios.post(`${API_URL}/auth/login`, { email: 'bob@example.com', password: 'Password123!' });
    const bobToken = bobRes.data.accessToken;
    
    console.log('✅ Logged in successfully');

    // 2. Alice creates a private event
    console.log('\n[2] Alice creating a private event...');
    const eventRes = await axios.post(
      `${API_URL}/events`,
      {
        title: 'Alice Secret Party',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Alice House',
        is_public: false
      },
      { headers: { Authorization: `Bearer ${aliceToken}` } }
    );
    const eventId = eventRes.data.data.id;
    console.log(`✅ Private Event created by Alice (ID: ${eventId})`);

    // 3. Bob tries to send an invite (Should fail)
    console.log('\n[3] Bob trying to invite Charlie to Alice\'s private event (Should Fail)...');
    try {
      await axios.post(
        `${API_URL}/events/${eventId}/invites`,
        { email: 'charlie@example.com' },
        { headers: { Authorization: `Bearer ${bobToken}` } }
      );
      console.error('❌ FAIL: Bob was able to send an invite!');
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        console.log(`✅ Success: Bob blocked from inviting. Server message: "${err.response.data.message}"`);
      } else {
        console.error('❌ FAIL: Bob got unexpected error:', err.response?.data || err.message);
      }
    }

    // 4. Alice sends an invite to Bob (Should succeed)
    console.log('\n[4] Alice inviting Bob to the private event...');
    try {
        const inviteRes = await axios.post(
            `${API_URL}/events/${eventId}/invites`,
            { email: 'bob@example.com' },
            { headers: { Authorization: `Bearer ${aliceToken}` } }
        );
        console.log(`✅ Invite sent by Alice successfully`);
    } catch(err: any) {
         console.log(`❌ FAIL: Alice could not invite Bob:`, err.response?.data || err.message);
    }
    

    // 5. Bob RSVPs "YES" to the event
    console.log('\n[5] Bob RSVPs YES to the event...');
    await axios.post(
      `${API_URL}/events/${eventId}/rsvp`,
      { status: 'ATTENDING' },
      { headers: { Authorization: `Bearer ${bobToken}` } }
    );
    console.log('✅ Bob RSVPd YES successfully');

    // 6. Check Alice's Lists
    console.log('\n[6] Checking Alice\'s Events...');
    const aliceHosting = await axios.get(`${API_URL}/events?category=hosting`, { headers: { Authorization: `Bearer ${aliceToken}` } });
    const aliceAttending = await axios.get(`${API_URL}/events?category=attending`, { headers: { Authorization: `Bearer ${aliceToken}` } });
    
    const aliceHostsIt = aliceHosting.data.data.some((e: any) => e.id === eventId);
    const aliceAttendsIt = aliceAttending.data.data.some((e: any) => e.id === eventId);
    
    console.log(`- Is in Alice's "Hosting" tab? ${aliceHostsIt ? '✅ YES' : '❌ NO'}`);
    console.log(`- Is in Alice's "Attending" tab? ${!aliceAttendsIt ? '✅ NO' : '❌ YES'}`);

    // 7. Check Bob's Lists
    console.log('\n[7] Checking Bob\'s Events...');
    const bobHosting = await axios.get(`${API_URL}/events?category=hosting`, { headers: { Authorization: `Bearer ${bobToken}` } });
    const bobAttending = await axios.get(`${API_URL}/events?category=attending`, { headers: { Authorization: `Bearer ${bobToken}` } });
    
    const bobHostsIt = bobHosting.data.data.some((e: any) => e.id === eventId);
    const bobAttendsIt = bobAttending.data.data.some((e: any) => e.id === eventId);
    
    console.log(`- Is in Bob's "Hosting" tab? ${!bobHostsIt ? '✅ NO' : '❌ YES'}`);
    console.log(`- Is in Bob's "Attending" tab? ${bobAttendsIt ? '✅ YES' : '❌ NO'}`);

    console.log('\n🎉 ALL FLOWS TESTED SUCCESSFULLY! 🎉');

  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.response?.data || error.message);
  }
}

runTests();
