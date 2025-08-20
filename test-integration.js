// Test script to demonstrate Helpline Backend-Frontend Integration
const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';
const FRONTEND_URL = 'http://localhost:3000';

async function testIntegration() {
  console.log('🧪 Testing Helpline Full Integration...\n');

  try {
    // Test 1: Backend Health Check
    console.log('1. ✅ Backend Health Check');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Message: ${healthResponse.data.message}`);
    console.log(`   Version: ${healthResponse.data.version}\n`);

    // Test 2: Frontend Accessibility
    console.log('2. ✅ Frontend Accessibility');
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log(`   Frontend Status: ${frontendResponse.status}`);
    console.log(`   Frontend Running: ${frontendResponse.status === 200 ? 'Yes' : 'No'}\n`);

    // Test 3: User Registration (Test)
    console.log('3. 🔐 User Registration Test');
    try {
      const testUser = {
        purdueId: 'TEST123456',
        email: 'test@purdue.edu',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        major: 'Computer Science',
        year: 'Junior'
      };
      
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log(`   Registration: Success (${registerResponse.status})`);
      console.log(`   User ID: ${registerResponse.data._id}`);
      console.log(`   Token: ${registerResponse.data.token ? 'Generated' : 'None'}\n`);
      
      // Test 4: User Login
      console.log('4. 🔑 User Login Test');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'test@purdue.edu',
        password: 'testpassword123'
      });
      console.log(`   Login: Success (${loginResponse.status})`);
      console.log(`   User: ${loginResponse.data.firstName} ${loginResponse.data.lastName}`);
      console.log(`   Token: ${loginResponse.data.token ? 'Valid' : 'Invalid'}\n`);

      // Test 5: Health Profile Creation
      console.log('5. 🏥 Health Profile Creation Test');
      const token = loginResponse.data.token;
      const healthData = {
        dateOfBirth: '2000-01-01',
        age: 23,
        bloodType: 'O+',
        allergies: ['Peanuts'],
        medications: ['None'],
        campusLocation: 'Academic Campus',
        residence: 'Cary Quadrangle',
        emergencyContacts: {
          primary: {
            name: 'John Doe',
            relationship: 'Parent',
            phone: '+1234567890'
          }
        }
      };
      
      const healthResponse = await axios.post(`${API_BASE}/health`, healthData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`   Health Profile: Created (${healthResponse.status})`);
      console.log(`   Profile ID: ${healthResponse.data.healthProfile._id}\n`);

      // Test 6: QR Code Data Generation
      console.log('6. 📱 QR Code Data Test');
      const qrResponse = await axios.get(`${API_BASE}/health/qr-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`   QR Data: Generated (${qrResponse.status})`);
      console.log(`   Data Type: ${qrResponse.data.type}`);
      console.log(`   Version: ${qrResponse.data.version}\n`);

      // Test 7: Emergency SOS Test
      console.log('7. 🚨 Emergency SOS Test');
      const sosData = {
        description: 'Test emergency situation',
        symptoms: ['Test symptom'],
        location: {
          coordinates: [-86.9212, 40.4237], // Purdue coordinates
          campusLocation: 'Academic Campus'
        }
      };
      
      const sosResponse = await axios.post(`${API_BASE}/emergency/sos`, sosData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`   SOS Alert: Sent (${sosResponse.status})`);
      console.log(`   Alert ID: ${sosResponse.data.alertId}\n`);

      // Test 8: Beacon Activation Test
      console.log('8. 📡 Campus Beacon Test');
      const beaconData = {
        location: {
          coordinates: [-86.9212, 40.4237],
          campusLocation: 'Academic Campus'
        },
        duration: 300,
        description: 'Test beacon activation'
      };
      
      const beaconResponse = await axios.post(`${API_BASE}/beacon/activate`, beaconData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`   Beacon: Activated (${beaconResponse.status})`);
      console.log(`   Beacon ID: ${beaconResponse.data.alertId}\n`);

      console.log('🎉 All Integration Tests Passed Successfully!');
      console.log('\n📋 Integration Summary:');
      console.log('   ✅ Backend API: Running and responding');
      console.log('   ✅ Frontend App: Accessible and running');
      console.log('   ✅ User Authentication: Working');
      console.log('   ✅ Health Profiles: Creating and managing');
      console.log('   ✅ QR Code Generation: Functional');
      console.log('   ✅ Emergency System: Operational');
      console.log('   ✅ Campus Beacon: Active');
      console.log('\n🚀 Your Helpline app is now fully integrated with the backend!');
      console.log('\n📱 Next steps:');
      console.log('   1. Open http://localhost:3000 in your browser');
      console.log('   2. Register a new account or login');
      console.log('   3. Create your health profile');
      console.log('   4. Test the emergency features');
      console.log('   5. Generate and scan QR codes');

    } catch (error) {
      if (error.response) {
        console.log(`   Error: ${error.response.status} - ${error.response.data.error || error.message}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }

  } catch (error) {
    console.log('❌ Integration test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure backend is running: npm run dev (in backend folder)');
    console.log('   2. Make sure frontend is running: npm start');
    console.log('   3. Check MongoDB is running: brew services list | grep mongodb');
  }
}

// Run the integration test
testIntegration();
