/**
 * 🧪 Test PPTX Processing API
 * Tests the /api/v1/pptx/process endpoint with real PPTX files
 */

const fs = require('fs');
const path = require('path');

async function testPPTXProcessingAPI() {
  console.log('🧪 Testing PPTX Processing API...\n');

  const baseUrl = 'http://localhost:3001';
  const testFile = path.join(__dirname, '..', 'test.pptx');
  
  // Check if test file exists
  if (!fs.existsSync(testFile)) {
    console.error('❌ Test file not found:', testFile);
    return;
  }

  console.log('📁 Test file found:', testFile);
  console.log('📊 File size:', fs.statSync(testFile).size, 'bytes\n');

  try {
    // Test 1: Upload PPTX file to S3 first (simulated)
    console.log('🔄 Test 1: Testing PPTX processing with cloud storage path...');
    
    const processResponse = await fetch(`${baseUrl}/api/v1/pptx/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cloud_storage_path: 'test/test.pptx', // Simulated S3 path
        project_id: 'test-project-' + Date.now()
      })
    });

    console.log('📡 Response status:', processResponse.status);
    
    if (processResponse.ok) {
      const result = await processResponse.json();
      console.log('✅ Processing successful!');
      console.log('📊 Result summary:');
      console.log('   - Slides processed:', result.data?.slides?.length || 0);
      console.log('   - Total duration:', result.data?.totalDuration || 0);
      console.log('   - Processing time:', result.data?.processingTime || 'N/A');
      console.log('   - Status:', result.data?.status || 'unknown');
    } else {
      const error = await processResponse.text();
      console.log('❌ Processing failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  try {
    // Test 2: Test the process-engine endpoint with file upload
    console.log('\n🔄 Test 2: Testing PPTX process-engine with file upload...');
    
    const fileBuffer = fs.readFileSync(testFile);
    const formData = new FormData();
    
    // Create a File-like object for Node.js
    const file = new File([fileBuffer], 'test.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    formData.append('file', file);
    formData.append('options', JSON.stringify({
      extractImages: true,
      generateNarration: true,
      qualityLevel: 'high'
    }));

    const engineResponse = await fetch(`${baseUrl}/api/v1/pptx/process-engine`, {
      method: 'POST',
      body: formData
    });

    console.log('📡 Response status:', engineResponse.status);
    
    if (engineResponse.ok) {
      const result = await engineResponse.json();
      console.log('✅ Engine processing successful!');
      console.log('📊 Result summary:');
      console.log('   - Project ID:', result.data?.id || 'N/A');
      console.log('   - Slides:', result.data?.slides?.length || 0);
      console.log('   - Video scenes:', result.data?.videoScenes?.length || 0);
      console.log('   - Total duration:', result.data?.timeline?.totalDuration || 0);
      console.log('   - Status:', result.data?.status || 'unknown');
    } else {
      const error = await engineResponse.text();
      console.log('❌ Engine processing failed:', error);
    }

  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }

  try {
    // Test 3: Test health check
    console.log('\n🔄 Test 3: Testing API health...');
    
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Health check passed');
      console.log('📊 System status:');
      console.log('   - Overall:', health.status || 'unknown');
      console.log('   - Database:', health.checks?.database?.status || 'unknown');
      console.log('   - Redis:', health.checks?.redis?.status || 'unknown');
    } else {
      console.log('❌ Health check failed');
    }

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  console.log('\n🏁 PPTX API testing completed!');
}

// Run the test
testPPTXProcessingAPI().catch(console.error);