# API Reference

This document provides complete documentation for the Video Caption Suite REST API and WebSocket interface.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, the API does not require authentication. It is designed for local use.

---

## Settings Endpoints

### Get Settings

Retrieve current application settings.

```http
GET /api/settings
```

**Response** `200 OK`

```json
{
  "model_id": "Qwen/Qwen3-VL-8B-Instruct",
  "device": "cuda",
  "dtype": "bfloat16",
  "max_frames": 128,
  "frame_size": 336,
  "max_tokens": 512,
  "temperature": 0.3,
  "use_torch_compile": true,
  "use_sage_attention": false,
  "working_directory": "C:/Users/username",
  "prompt": "Describe this video in detail...",
  "batch_size": 1
}
```

### Update Settings

Update one or more settings. Partial updates are supported.

```http
POST /api/settings
Content-Type: application/json
```

**Request Body** (partial update example)

```json
{
  "max_frames": 64,
  "temperature": 0.5
}
```

**Response** `200 OK`

Returns the complete updated settings object.

### Reset Settings

Reset all settings to default values.

```http
POST /api/settings/reset
```

**Response** `200 OK`

Returns the default settings object.

---

## System Endpoints

### Get GPU Information

Retrieve system GPU information.

```http
GET /api/system/gpu
```

**Response** `200 OK`

```json
{
  "gpus": [
    {
      "index": 0,
      "name": "NVIDIA GeForce RTX 4090",
      "memory_total": 25769803776,
      "memory_free": 24000000000
    },
    {
      "index": 1,
      "name": "NVIDIA GeForce RTX 4090",
      "memory_total": 25769803776,
      "memory_free": 25000000000
    }
  ],
  "count": 2,
  "cuda_available": true
}
```

---

## Directory Endpoints

### Get Current Directory

Get the current working directory.

```http
GET /api/directory
```

**Response** `200 OK`

```json
{
  "path": "C:/Users/username/Videos"
}
```

### Set Working Directory

Set the working directory for video processing.

```http
POST /api/directory
Content-Type: application/json
```

**Request Body**

```json
{
  "path": "C:/Users/username/Videos"
}
```

**Response** `200 OK`

```json
{
  "path": "C:/Users/username/Videos",
  "success": true
}
```

**Error Responses**

- `400 Bad Request` - Path contains `..` (path traversal attempt)
- `404 Not Found` - Directory does not exist

### Browse Directory

Browse the file system to select a directory.

```http
GET /api/directory/browse?path=/Users/username
```

**Query Parameters**

| Parameter | Type   | Description                    |
|-----------|--------|--------------------------------|
| path      | string | Directory path to browse       |

**Response** `200 OK`

```json
{
  "current_path": "/Users/username",
  "parent_path": "/Users",
  "directories": [
    {"name": "Documents", "path": "/Users/username/Documents"},
    {"name": "Videos", "path": "/Users/username/Videos"},
    {"name": "Downloads", "path": "/Users/username/Downloads"}
  ]
}
```

---

## Prompt Library Endpoints

### List Prompts

Get all saved prompts.

```http
GET /api/prompts
```

**Response** `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Basic Description",
    "prompt": "Describe this video in detail.",
    "created_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "name": "Scene Analysis",
    "prompt": "Analyze this video scene by scene...",
    "created_at": "2024-01-16T14:20:00Z"
  }
]
```

### Create Prompt

Save a new prompt to the library.

```http
POST /api/prompts
Content-Type: application/json
```

**Request Body**

```json
{
  "name": "My Custom Prompt",
  "prompt": "Describe the actions and objects in this video..."
}
```

**Response** `201 Created`

```json
{
  "id": "generated-uuid",
  "name": "My Custom Prompt",
  "prompt": "Describe the actions and objects in this video...",
  "created_at": "2024-01-17T09:00:00Z"
}
```

### Get Prompt

Retrieve a specific prompt by ID.

```http
GET /api/prompts/{id}
```

**Response** `200 OK`

Returns the prompt object.

**Error Response**

- `404 Not Found` - Prompt with given ID not found

### Update Prompt

Update an existing prompt.

```http
PUT /api/prompts/{id}
Content-Type: application/json
```

**Request Body**

```json
{
  "name": "Updated Name",
  "prompt": "Updated prompt text..."
}
```

**Response** `200 OK`

Returns the updated prompt object.

### Delete Prompt

Delete a prompt from the library.

```http
DELETE /api/prompts/{id}
```

**Response** `204 No Content`

---

## Video Endpoints

### List Videos

Get all videos in the working directory.

```http
GET /api/videos?fast=false
```

**Query Parameters**

| Parameter | Type    | Default | Description                              |
|-----------|---------|---------|------------------------------------------|
| fast      | boolean | false   | Skip ffprobe metadata (faster loading)   |

**Response** `200 OK`

```json
{
  "videos": [
    {
      "name": "video1.mp4",
      "path": "C:/Videos/video1.mp4",
      "size": 1048576,
      "duration": 120.5,
      "width": 1920,
      "height": 1080,
      "fps": 30.0,
      "frame_count": 3615,
      "has_caption": true,
      "modified_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### Stream Videos (SSE)

Stream videos progressively using Server-Sent Events.

```http
GET /api/videos/stream
```

**Response** `200 OK` (text/event-stream)

```
data: {"type": "video", "data": {"name": "video1.mp4", ...}}

data: {"type": "video", "data": {"name": "video2.mp4", ...}}

data: {"type": "complete", "total": 2}
```

### Upload Video

Upload a video file to the working directory.

```http
POST /api/videos/upload
Content-Type: multipart/form-data
```

**Form Data**

| Field | Type | Description          |
|-------|------|----------------------|
| file  | File | Video file to upload |

**Response** `201 Created`

```json
{
  "name": "uploaded_video.mp4",
  "path": "C:/Videos/uploaded_video.mp4",
  "size": 1048576
}
```

**Error Responses**

- `400 Bad Request` - Invalid file type (not a supported video format)
- `413 Payload Too Large` - File exceeds size limit

### Delete Video

Delete a video file.

```http
DELETE /api/videos/{name}
```

**Response** `204 No Content`

**Error Response**

- `404 Not Found` - Video file not found

### Get Video Thumbnail

Get or generate a thumbnail for a video.

```http
GET /api/videos/{name}/thumbnail
```

**Response** `200 OK`

Returns JPEG image with caching headers.

**Headers**

```
Content-Type: image/jpeg
Cache-Control: public, max-age=86400
```

### Stream Video

Stream a video file for playback.

```http
GET /api/videos/{name}/stream
```

**Headers**

Supports `Range` header for seeking.

**Response** `200 OK` or `206 Partial Content`

```
Content-Type: video/mp4
Accept-Ranges: bytes
Content-Range: bytes 0-1023/1048576
```

---

## Caption Endpoints

### List Captions

Get all captions in the working directory.

```http
GET /api/captions
```

**Response** `200 OK`

```json
{
  "captions": [
    {
      "name": "video1.txt",
      "video_name": "video1.mp4",
      "path": "C:/Videos/video1.txt",
      "size": 1024,
      "content": "A detailed description of the video...",
      "created_at": "2024-01-15T11:00:00Z"
    }
  ],
  "total": 1
}
```

### Get Caption

Get a specific caption.

```http
GET /api/captions/{name}
```

**Response** `200 OK`

```json
{
  "name": "video1.txt",
  "video_name": "video1.mp4",
  "content": "A detailed description of the video...",
  "created_at": "2024-01-15T11:00:00Z"
}
```

**Error Response**

- `404 Not Found` - Caption file not found

### Delete Caption

Delete a caption file.

```http
DELETE /api/captions/{name}
```

**Response** `204 No Content`

### Clear Thumbnail Cache

Delete all cached thumbnails.

```http
DELETE /api/thumbnails/cache
```

**Response** `200 OK`

```json
{
  "deleted": 15,
  "message": "Cleared 15 cached thumbnails"
}
```

---

## Model Endpoints

### Get Model Status

Check if the model is loaded and ready.

```http
GET /api/model/status
```

**Response** `200 OK`

```json
{
  "loaded": true,
  "model_id": "Qwen/Qwen3-VL-8B-Instruct",
  "device": "cuda:0",
  "vram_used": 16500000000,
  "optimizations": {
    "torch_compile": true,
    "sage_attention": false
  }
}
```

### Load Model

Pre-load the model into memory.

```http
POST /api/model/load
```

**Response** `200 OK`

```json
{
  "success": true,
  "load_time": 45.2,
  "vram_used": 16500000000
}
```

**Note**: This endpoint is blocking and may take 30-60 seconds.

### Unload Model

Unload the model to free VRAM.

```http
POST /api/model/unload
```

**Response** `200 OK`

```json
{
  "success": true,
  "vram_freed": 16500000000
}
```

---

## Processing Endpoints

### Start Processing

Begin processing selected videos.

```http
POST /api/process/start
Content-Type: application/json
```

**Request Body**

```json
{
  "videos": ["video1.mp4", "video2.mp4"],
  "prompt": "Describe this video in detail...",
  "settings": {
    "max_frames": 64,
    "temperature": 0.3
  }
}
```

**Parameters**

| Field    | Type     | Required | Description                          |
|----------|----------|----------|--------------------------------------|
| videos   | string[] | Yes      | List of video filenames to process   |
| prompt   | string   | No       | Override the default prompt          |
| settings | object   | No       | Override settings for this batch     |

**Response** `202 Accepted`

```json
{
  "message": "Processing started",
  "total_videos": 2,
  "batch_size": 1
}
```

**Error Responses**

- `400 Bad Request` - Invalid request or no videos specified
- `409 Conflict` - Processing already in progress

### Stop Processing

Stop the current processing operation.

```http
POST /api/process/stop
```

**Response** `200 OK`

```json
{
  "message": "Processing stopped",
  "videos_completed": 5,
  "videos_remaining": 3
}
```

### Get Processing Status

Get the current processing status.

```http
GET /api/process/status
```

**Response** `200 OK`

```json
{
  "stage": "PROCESSING",
  "substage": "GENERATING",
  "progress": 0.45,
  "current_video": "video3.mp4",
  "current_index": 3,
  "total_videos": 10,
  "tokens_generated": 1250,
  "generation_speed": 25.5,
  "vram_used": 16500000000,
  "elapsed_time": 120.5,
  "workers": [
    {
      "device": "cuda:0",
      "status": "processing",
      "current_video": "video3.mp4",
      "videos_completed": 2
    }
  ]
}
```

**Stage Values**

| Stage         | Description                    |
|---------------|--------------------------------|
| IDLE          | No processing active           |
| LOADING_MODEL | Model is being loaded          |
| PROCESSING    | Videos are being processed     |
| COMPLETE      | Processing finished            |
| ERROR         | An error occurred              |

**Substage Values** (during PROCESSING)

| Substage          | Description                      |
|-------------------|----------------------------------|
| IDLE              | Worker idle                      |
| EXTRACTING_FRAMES | Extracting frames from video     |
| ENCODING          | Encoding frames for model input  |
| GENERATING        | Model generating caption         |

---

## WebSocket API

### Progress Updates

Connect to receive real-time processing updates.

```
WS /ws/progress
```

**Connection**

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/progress');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Progress:', data);
};
```

**Message Format**

```json
{
  "type": "progress",
  "data": {
    "stage": "PROCESSING",
    "substage": "GENERATING",
    "progress": 0.45,
    "current_video": "video3.mp4",
    "current_index": 3,
    "total_videos": 10,
    "tokens_generated": 1250,
    "tokens_per_second": 25.5,
    "vram_used_mb": 16500,
    "elapsed_seconds": 120.5,
    "workers": [
      {
        "device": "cuda:0",
        "status": "processing",
        "current_video": "video3.mp4",
        "progress": 0.75
      }
    ]
  }
}
```

**Message Types**

| Type     | Description                           |
|----------|---------------------------------------|
| progress | Processing progress update            |
| complete | Processing finished successfully      |
| error    | An error occurred during processing   |
| status   | General status update                 |

**Complete Message**

```json
{
  "type": "complete",
  "data": {
    "total_videos": 10,
    "successful": 10,
    "failed": 0,
    "total_time": 450.2,
    "total_tokens": 12500
  }
}
```

**Error Message**

```json
{
  "type": "error",
  "data": {
    "message": "CUDA out of memory",
    "video": "video5.mp4",
    "fatal": false
  }
}
```

---

## Health Check

### Health Endpoint

Check if the API is running.

```http
GET /api/health
```

**Response** `200 OK`

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600
}
```

---

## Error Responses

All endpoints may return these common error responses:

### 400 Bad Request

```json
{
  "detail": "Invalid request: missing required field 'path'"
}
```

### 404 Not Found

```json
{
  "detail": "Resource not found"
}
```

### 409 Conflict

```json
{
  "detail": "Processing already in progress"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error: CUDA out of memory"
}
```

---

## Rate Limits

Currently, no rate limits are enforced for local use. When deploying to a shared environment, consider implementing rate limiting.

---

## Supported Video Formats

The following video extensions are supported:

- `.mp4`
- `.avi`
- `.mov`
- `.mkv`
- `.webm`
- `.flv`
- `.wmv`
- `.m4v`
- `.mpeg`
- `.mpg`
- `.3gp`
- `.gif`
