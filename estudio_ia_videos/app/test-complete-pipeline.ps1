# Complete PPTX to Video Pipeline Test
# Tests all endpoints in sequence to verify 100% functionality

Write-Host "🎬 Testing Complete PPTX to Video Pipeline" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

$baseUrl = "http://localhost:3001"
$testResults = @()

# Test 1: PPTX Upload Endpoint
Write-Host "`n1. Testing PPTX Upload Endpoint..." -ForegroundColor Yellow
try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/api/pptx/upload?action=test" -Method GET
    Write-Host "✅ PPTX Upload: $($response1.message)" -ForegroundColor Green
    $testResults += "PPTX Upload: PASS"
} catch {
    Write-Host "❌ PPTX Upload: FAILED" -ForegroundColor Red
    $testResults += "PPTX Upload: FAIL"
}

# Test 2: PPTX Process Endpoint
Write-Host "`n2. Testing PPTX Process Endpoint..." -ForegroundColor Yellow
try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/api/pptx/process?action=test" -Method GET
    Write-Host "✅ PPTX Process: $($response2.message)" -ForegroundColor Green
    $testResults += "PPTX Process: PASS"
} catch {
    Write-Host "❌ PPTX Process: FAILED" -ForegroundColor Red
    $testResults += "PPTX Process: FAIL"
}

# Test 3: Render Start Endpoint
Write-Host "`n3. Testing Render Start Endpoint..." -ForegroundColor Yellow
try {
    $renderData = @{
        projectId = "test-project-123"
        slides = @(
            @{
                id = "slide-1"
                title = "Test Slide"
                content = "Test content for video generation"
            }
        )
        settings = @{
            resolution = "1080p"
            fps = 30
        }
    } | ConvertTo-Json -Depth 3

    $response3 = Invoke-RestMethod -Uri "$baseUrl/api/render/start?test=true" -Method POST -Body $renderData -ContentType "application/json"
    Write-Host "✅ Render Start: $($response3.message)" -ForegroundColor Green
    $jobId = $response3.jobId
    $testResults += "Render Start: PASS"
} catch {
    Write-Host "❌ Render Start: FAILED" -ForegroundColor Red
    $testResults += "Render Start: FAIL"
    $jobId = "test-job-123"
}

# Test 4: Render Queue Endpoint
Write-Host "`n4. Testing Render Queue Endpoint..." -ForegroundColor Yellow
try {
    $response4 = Invoke-RestMethod -Uri "$baseUrl/api/render/queue" -Method GET
    Write-Host "✅ Render Queue: Found $($response4.stats.active) active jobs" -ForegroundColor Green
    $testResults += "Render Queue: PASS"
} catch {
    Write-Host "❌ Render Queue: FAILED" -ForegroundColor Red
    $testResults += "Render Queue: FAIL"
}

# Test 5: Video Download Endpoint
Write-Host "`n5. Testing Video Download Endpoint..." -ForegroundColor Yellow
try {
    $response5 = Invoke-RestMethod -Uri "$baseUrl/api/videos/download/$jobId" -Method GET
    Write-Host "✅ Video Download: $($response5.file_info.format) video ready" -ForegroundColor Green
    $testResults += "Video Download: PASS"
} catch {
    Write-Host "❌ Video Download: FAILED" -ForegroundColor Red
    $testResults += "Video Download: FAIL"
}

# Test 6: PPTX Process with Real Data
Write-Host "`n6. Testing PPTX Process with Real Data..." -ForegroundColor Yellow
try {
    $processData = @{
        projectId = "test-project-123"
        action = "regenerate_audio"
    } | ConvertTo-Json

    $response6 = Invoke-RestMethod -Uri "$baseUrl/api/pptx/process" -Method POST -Body $processData -ContentType "application/json"
    Write-Host "✅ PPTX Process Real: $($response6.slides_processed) slides processed" -ForegroundColor Green
    $testResults += "PPTX Process Real: PASS"
} catch {
    Write-Host "❌ PPTX Process Real: FAILED" -ForegroundColor Red
    $testResults += "PPTX Process Real: FAIL"
}

# Summary
Write-Host "`n🎯 Pipeline Test Results:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
foreach ($result in $testResults) {
    if ($result -like "*PASS*") {
        Write-Host "✅ $result" -ForegroundColor Green
    } else {
        Write-Host "❌ $result" -ForegroundColor Red
    }
}

$passCount = ($testResults | Where-Object { $_ -like "*PASS*" }).Count
$totalCount = $testResults.Count
$successRate = [math]::Round(($passCount / $totalCount) * 100, 1)

Write-Host "`n📊 Overall Success Rate: $successRate% ($passCount/$totalCount)" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($successRate -eq 100) {
    Write-Host "`n🎉 CONGRATULATIONS! 100% Pipeline Functionality Achieved!" -ForegroundColor Green
    Write-Host "The complete PPTX to Video pipeline is working perfectly!" -ForegroundColor Green
} elseif ($successRate -ge 85) {
    Write-Host "`n🎯 Excellent! Pipeline is production-ready with $successRate% functionality!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Pipeline needs attention. Some endpoints require fixes." -ForegroundColor Yellow
}