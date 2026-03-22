# 77mobiles

## Current State

PostAdPage exists at `/post` with a basic form UI. The backend `createListing` function requires `#user` role which blocks newly registered users. Video upload exists as UI-only (not uploaded to storage). The form design is plain/minimal.

## Requested Changes (Diff)

### Add
- Blob storage video upload: upload 360° video file to blob storage before submitting listing, store video URL in listing description with `[Video: <url>]` prefix
- Dark navy + yellow accent UI design for PostAdPage matching IMG_9744 reference (dark navy background, yellow gold accents, clean white card form)

### Modify
- Backend `createListing`: remove `#user` role gate — allow any authenticated (non-anonymous) caller to post
- PostAdPage: full UI redesign with dark navy hero header, yellow accents, card form with clean inputs, upload progress for video

### Remove
- Role-based auth check in createListing (replaced by anonymous check)

## Implementation Plan

1. Fix main.mo createListing: replace `AccessControl.hasPermission(caller, #user)` with a simple check that caller is not anonymous principal
2. Update PostAdPage with new navy/yellow design: hero header with title in yellow, card form, blob storage video upload with progress indicator
3. In handleSubmit: if videoFile selected, convert to Uint8Array, call ExternalBlob.fromBytes().withUploadProgress() upload, get URL, prepend `[Video: <url>]` to description
