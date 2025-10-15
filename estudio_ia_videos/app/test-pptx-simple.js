// Simple PPTX API Test
const fs = require('fs');
const path = require('path');

async function testAPI() {
  console.log('Testing PPTX API...');
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Test health endpoint first
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    console.log('Health status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('Health result:', JSON.stringify(health, null, 2));
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI()