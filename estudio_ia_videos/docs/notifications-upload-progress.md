# Upload Progress Notifications

This document describes how real-time notifications are emitted during the PPTX upload and processing pipeline, and how clients should subscribe to receive these updates.

## Room naming convention

- Each project has a dedicated room for upload progress events:
  - `roomId = project:{projectId}:uploads`

Clients should subscribe to this room to receive upload progress notifications for that project.

## Notification types

The following NotificationManager types are used:

- `upload_started` — emitted as soon as a PPTX upload is accepted and the processing job is queued.
- `video_processing` — emitted when the server transitions an upload to processing and begins extracting slides.
- `upload_progress` — mid-stage progress updates (e.g., after slide extraction, before thumbnails/assets generation).
- `upload_complete` — final completion notification with metadata and preview URL.
- `upload_error` — failure notification with basic error information.
- `system_alert` — used for administrative messages (e.g., when an upload is deleted).

## Subscription requirements

The WebSocket server creates a general subscription on authenticate, but notifications that include a `roomId` will only be delivered to clients that explicitly subscribe to that room.

To receive upload progress events:

1. Connect to the socket server and authenticate.
2. Call `subscribe` with `roomIds` including `project:{projectId}:uploads`.
3. Optionally also call `join_room` for presence and room history.

Example subscription payload:

```json
{
  "action": "subscribe",
  "types": ["upload_started", "video_processing", "upload_progress", "upload_complete", "upload_error"],
  "roomIds": ["project:YOUR_PROJECT_ID:uploads"]
}
```

## Emission points

Notifications are emitted from `app/api/pptx/upload/route.ts`:

- On POST (upload) before starting asynchronous processing: `upload_started`.
- Inside `processPPTXAsync` when status changes to processing: `video_processing`.
- After slide extraction (mid progress): `upload_progress`.
- On successful completion: `upload_complete` (persistent).
- On error: `upload_error` (persistent).

Additionally, DELETE `/api/pptx/upload/[id]` will emit a `system_alert` to inform the project room that an upload was removed.

## Payload structure

All notifications include:

- `id`: unique identifier string
- `type`: notification type (see above)
- `title`, `message`: human-readable message
- `priority`: low | medium | high
- `timestamp`: milliseconds since epoch
- `roomId`: `project:{projectId}:uploads`
- `data`: object containing upload context (e.g., `uploadId`, `phase`, `progress`, `percentage`, `slideCount`, `previewUrl`)

## Client handling tips

- Maintain a progress bar based on `data.progress` or `data.percentage`.
- Treat `upload_complete` and `upload_error` as terminal states.
- Use `uploadId` to correlate client-side upload requests with server-side notifications.