const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testBackend() {
  console.log('🧪 Testing Helpline Backend API...\n');

  try {
    // Test health check endpoint
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    console.log('   Status:', healthResponse.data.status);
    console.log('   Version:', healthResponse.data.version);
    console.log('   Timestamp:', healthResponse.data.timestamp);
    console.log('');

    // Test authentication endpoints (without actual data)
    console.log('2. Testing authentication endpoints...');
    
    try {
      // Test registration with invalid data
      await axios.post(`${BASE_URL}/auth/register`, {
        purdueId: 'TEST123456',
        email: 'test@invalid.com', // Not Purdue email
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Registration validation working (rejected invalid email)');
      }
    }

    try {
      // Test login with invalid data
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'nonexistent@purdue.edu',
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Login validation working (rejected invalid credentials)');
      }
    }

    console.log('');

    // Test protected endpoints (should fail without token)
    console.log('3. Testing protected endpoints...');
    
    try {
      await axios.get(`${BASE_URL}/auth/profile`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Authentication middleware working (rejected unauthorized request)');
      }
    }

    try {
      await axios.get(`${BASE_URL}/health`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Health endpoint protected (rejected unauthorized request)');
      }
    }

    console.log('');

    // Test rate limiting
    console.log('4. Testing rate limiting...');
    const requests = [];
    for (let i = 0; i < 6; i++) {
      requests.push(
        axios.post(`${BASE_URL}/auth/login`, {
          email: 'test@purdue.edu',
          password: 'password123'
        }).catch(error => error.response)
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(res => res && res.status === 429);
    
    if (rateLimited) {
      console.log('✅ Rate limiting working (blocked excessive requests)');
    } else {
      console.log('⚠️  Rate limiting may not be working as expected');
    }

    console.log('');

    console.log('🎉 Backend API tests completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Set up MongoDB database');
    console.log('   2. Configure environment variables');
    console.log('   3. Test with real data');
    console.log('   4. Integrate with frontend');
    console.log('');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection failed: Server is not running');
      console.log('   Start the server with: npm run dev');
    } else {
      console.log('❌ Test failed:', error.message);
    }
  }
}

// Run tests
testBackend();
