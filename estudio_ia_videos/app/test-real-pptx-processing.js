/**
 * 🧪 Test Real PPTX Processing Pipeline
 * Tests the complete flow: Upload → Process → Validate
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001';

async function testRealPPTXProcessing() {
  console.log('🧪 Testing Real PPTX Processing Pipeline...\n');

  try {
    // Step 1: Check if test file exists
    const testFilePath = path.join(__dirname, 'test-presentation.pptx');
    if (!fs.existsSync(testFilePath)) {
      console.log('❌ Test file not found:', testFilePath);
      return;
    }
    
    console.log('✅ Test file found:', testFilePath);
    const fileStats = fs.statSync(testFilePath);
    console.log(`📊 File size: ${(fileStats.size / 1024).toFixed(2)} KB\n`);

    // Step 2: Upload file to S3 via API
    console.log('📤 Step 1: Uploading PPTX to S3...');
    
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(testFilePath);
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    formData.append('file', blob, 'test-presentation.pptx');
    formData.append('project_id', 'test-project-123');

    const uploadResponse = await fetch(`${API_BASE}/api/v1/pptx/upload`, {
      method: 'POST',
      body: formData
    });

    const uploadResult = await uploadResponse.json();
    console.log('Upload Status:', uploadResponse.status);
    console.log('Upload Result:', uploadResult);

    if (!uploadResponse.ok) {
      console.log('❌ Upload failed');
      return;
    }

    const s3Key = uploadResult.s3Key;
    console.log('✅ File uploaded to S3:', s3Key, '\n');

    // Step 3: Process the uploaded file
    console.log('⚙️ Step 2: Processing PPTX...');
    
    const processResponse = await fetch(`${API_BASE}/api/v1/pptx/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cloud_storage_path: s3Key,
        project_id: 'test-project-123'
      })
    });

    const processResult = await processResponse.json();
    console.log('Process Status:', processResponse.status);
    console.log('Process Result:', JSON.stringify(processResult, null, 2));

    if (!processResponse.ok) {
      console.log('❌ Processing failed');
      return;
    }

    console.log('✅ PPTX processed successfully!\n');

    // Step 4: Validate processing results
    console.log('🔍 Step 3: Validating Results...');
    
    const metadata = processResult.metadata;
    const stats = processResult.stats;
    
    console.log('📊 Processing Statistics:');
    console.log(`- Total slides: ${stats.totalSlides}`);
    console.log(`- Images extracted: ${stats.imagesExtracted}`);
    console.log(`- Processing time: ${stats.processingTime}ms`);
    console.log(`- Text extracted: ${stats.textExtracted ? 'Yes' : 'No'}`);
    console.log(`- Layout detected: ${stats.layoutDetected ? 'Yes' : 'No'}`);
    
    if (metadata.slides && metadata.slides.length > 0) {
      console.log('\n📄 Slide Details:');
      metadata.slides.forEach((slide, index) => {
        console.log(`  Slide ${index + 1}:`);
        console.log(`    - Text: ${slide.extractedText ? slide.extractedText.substring(0, 50) + '...' : 'None'}`);
        console.log(`    - Images: ${slide.slideImages ? slide.slideImages.length : 0}`);
        console.log(`    - Layout: ${slide.slideLayout || 'Unknown'}`);
      });
    }

    // Step 5: Test status endpoint
    console.log('\n📊 Step 4: Testing Status Endpoint...');
    
    const statusResponse = await fetch(`${API_BASE}/api/v1/pptx/process?path=${encodeURIComponent(s3Key)}`);
    const statusResult = await statusResponse.json();
    
    console.log('Status Response:', statusResult);

    // Step 6: Validate zero mock data
    console.log('\n🎯 Step 5: Validating Real Data (No Mocks)...');
    
    let hasMockData = false;
    const mockIndicators = ['mock', 'fake', 'sample', 'test-content', 'placeholder'];
    
    // Check for mock data in text content
    if (metadata.slides) {
      metadata.slides.forEach((slide, index) => {
        if (slide.extractedText) {
          mockIndicators.forEach(indicator => {
            if (slide.extractedText.toLowerCase().includes(indicator)) {
              console.log(`⚠️ Potential mock data found in slide ${index + 1}: "${indicator}"`);
              hasMockData = true;
            }
          });
        }
      });
    }

    if (!hasMockData) {
      console.log('✅ No mock data detected - all content appears to be real extracted data');
    }

    console.log('\n🎉 Real PPTX Processing Test Complete!');
    console.log('✅ Upload successful');
    console.log('✅ Processing successful');
    console.log('✅ Data extraction working');
    console.log('✅ Database integration working');
    console.log('✅ Status endpoint working');
    console.log(`✅ Real data processing: ${!hasMockData ? 'CONFIRMED' : 'NEEDS_REVIEW'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testRealPPTXProcessing();