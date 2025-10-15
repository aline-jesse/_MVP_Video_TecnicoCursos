# Test Video Fixtures

Generated test videos for E2E testing.

## Videos

- **test-720p-5s.mp4**: 720p H.264 video (5 seconds, 30fps)
  - Resolution: 1280x720
  - Duration: 5s
  - FPS: 30
  - Bitrate: 2M
  - Codec: libx264
 - **test-1080p-5s.mp4**: 1080p H.264 video (5 seconds, 30fps)
  - Resolution: 1920x1080
  - Duration: 5s
  - FPS: 30
  - Bitrate: 5M
  - Codec: libx264
 - **test-1080p-60fps-5s.mp4**: 1080p H.264 video (5 seconds, 60fps)
  - Resolution: 1920x1080
  - Duration: 5s
  - FPS: 60
  - Bitrate: 8M
  - Codec: libx264
 - **test-short-2s.mp4**: Short 720p video (2 seconds)
  - Resolution: 1280x720
  - Duration: 2s
  - FPS: 30
  - Bitrate: 2M
  - Codec: libx264


## Regenerate

```powershell
# Regenerate all videos
.\generate-test-videos.ps1 -Force

# Generate to custom directory
.\generate-test-videos.ps1 -OutputDir "custom/path"
```

## Usage in Tests

```typescript
import path from 'path'

const fixturesDir = path.join(__dirname, '../../fixtures/videos')
const testVideo = path.join(fixturesDir, 'test-720p-5s.mp4')

// Use in E2E tests
await pipeline.execute(testVideo, outputPath, settings)
```

---

Generated: 2025-10-09 20:31:29
