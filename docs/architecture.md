# Architecture Overview

This document describes the system architecture of Video Caption Suite, including component interactions, data flow, and design decisions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Video Caption Suite                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────────┐         ┌─────────────────────────────────────┐   │
│   │     Frontend        │         │            Backend                   │   │
│   │   (Vue 3 + Vite)    │◄───────►│         (FastAPI)                   │   │
│   │                     │  HTTP   │                                      │   │
│   │  ┌───────────────┐  │  REST   │  ┌─────────────────────────────┐   │   │
│   │  │   Pinia       │  │   +     │  │      Processing Manager     │   │   │
│   │  │   Stores      │  │  WS     │  │                             │   │   │
│   │  └───────────────┘  │         │  │  ┌───────┐  ┌───────┐      │   │   │
│   │                     │         │  │  │GPU 0  │  │GPU 1  │ ...  │   │   │
│   │  ┌───────────────┐  │         │  │  │Worker │  │Worker │      │   │   │
│   │  │  Components   │  │         │  │  └───────┘  └───────┘      │   │   │
│   │  └───────────────┘  │         │  └─────────────────────────────┘   │   │
│   └─────────────────────┘         │                                      │   │
│                                    │  ┌─────────────────────────────┐   │   │
│                                    │  │      Model Loader           │   │   │
│                                    │  │   (Qwen3-VL-8B)            │   │   │
│                                    │  └─────────────────────────────┘   │   │
│                                    │                                      │   │
│                                    │  ┌─────────────────────────────┐   │   │
│                                    │  │    Video Processor          │   │   │
│                                    │  │   (Frame Extraction)        │   │   │
│                                    │  └─────────────────────────────┘   │   │
│                                    └─────────────────────────────────────┘   │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         File System                                   │   │
│   │                                                                       │   │
│   │   /working_dir/          /models/              /.thumbnail_cache/    │   │
│   │   ├── video1.mp4         └── Qwen3-VL-8B/     └── hash1.jpg          │   │
│   │   ├── video1.txt                               └── hash2.jpg          │   │
│   │   └── video2.mp4                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Overview

### Backend Components

#### 1. API Layer (`backend/api.py`)

The FastAPI application serves as the central hub, providing:

- **REST Endpoints**: CRUD operations for videos, captions, settings, and prompts
- **WebSocket Server**: Real-time progress updates during processing
- **Static File Serving**: Serves the built Vue frontend
- **Video Streaming**: Serves video files for preview playback

Key responsibilities:
- Request validation using Pydantic schemas
- Route handling and response formatting
- WebSocket connection management
- CORS configuration for development

#### 2. Processing Manager (`backend/processing.py`)

Orchestrates the entire video processing pipeline:

- **Single-GPU Mode**: Sequential processing with one model instance
- **Multi-GPU Mode**: Parallel processing with worker distribution
- **State Management**: Tracks processing progress across all workers

Key classes:
- `WorkerState`: Per-GPU worker tracking (device, status, current video)
- `ProcessingState`: Global state (stage, progress, errors)
- `ProcessingManager`: Main orchestrator for all processing operations

#### 3. Model Loader (`model_loader.py`)

Handles AI model lifecycle:

- **Model Download**: Fetches Qwen3-VL-8B from HuggingFace Hub (~16GB)
- **Optimization Patching**: Applies SageAttention and torch.compile
- **Memory Management**: Tracks VRAM usage and provides unload capability
- **Caption Generation**: Processes frames and generates text output

#### 4. Video Processor (`video_processor.py`)

Extracts and prepares video frames:

- **Frame Sampling**: Uniform or first/last strategies
- **Metadata Extraction**: Duration, resolution, FPS, frame count
- **Image Resizing**: Maintains aspect ratio within size limits

#### 5. GPU Utilities (`backend/gpu_utils.py`)

System GPU detection and information:

- Device enumeration
- Memory capacity reporting
- Multi-GPU availability checking

#### 6. Data Schemas (`backend/schemas.py`)

Pydantic models for type safety:

- Settings validation
- API request/response typing
- Progress update structures
- Video and caption metadata

### Frontend Components

#### 1. State Management (Pinia Stores)

Three primary stores manage application state:

**videoStore**
- Video list and metadata
- Selection state
- Loading indicators
- CRUD operations

**settingsStore**
- Application configuration
- GPU information
- Settings persistence

**progressStore**
- Processing status
- WebSocket connection state
- Worker progress tracking

#### 2. Composables

Reusable composition functions:

- `useApi`: HTTP request utilities and API methods
- `useWebSocket`: WebSocket connection management
- `useResizable`: Draggable panel resizing

#### 3. Component Hierarchy

```
App.vue
├── AppHeader.vue
├── LayoutSidebar.vue
│   └── SettingsPanel.vue
│       ├── DirectorySettings.vue
│       ├── ModelSettings.vue
│       ├── InferenceSettings.vue
│       ├── OptimizationSettings.vue
│       └── PromptSettings.vue
├── VideoList.vue
│   ├── VideoGridToolbar.vue
│   └── VideoTile.vue (repeated)
├── StatusPanel.vue
│   ├── ProgressBar.vue
│   └── StageProgress.vue
└── CaptionPanel.vue (ResizablePanel)
    └── CaptionViewer.vue
```

## Data Flow

### 1. Application Initialization

```
Browser loads index.html
         │
         ▼
    Vue app mounts
         │
         ├──► settingsStore.fetchSettings()
         │           │
         │           ▼
         │    GET /api/settings
         │           │
         │           ▼
         │    Load from settings.json
         │
         ├──► settingsStore.fetchGPUInfo()
         │           │
         │           ▼
         │    GET /api/system/gpu
         │
         └──► videoStore.fetchVideos()
                     │
                     ▼
              GET /api/videos/stream (SSE)
                     │
                     ▼
              Progressive video list loading
```

### 2. Video Processing Flow

```
User selects videos and clicks "Process"
                │
                ▼
        POST /api/process/start
        {videos: [...], prompt: "...", settings: {...}}
                │
                ▼
    ┌───────────────────────────────────┐
    │      ProcessingManager            │
    │                                   │
    │  1. Check/load model(s)          │
    │  2. Determine single/multi-GPU   │
    │  3. Initialize workers           │
    └───────────────────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
   Single-GPU      Multi-GPU
   Sequential      Parallel
        │               │
        └───────┬───────┘
                ▼
    ┌─────────────────────────────────┐
    │     For each video:             │
    │                                 │
    │  1. extract_frames()            │
    │     └► OpenCV reads video       │
    │     └► Sample N frames          │
    │     └► Resize to max_size       │
    │                                 │
    │  2. generate_caption()          │
    │     └► Encode frames            │
    │     └► Model inference          │
    │     └► Decode tokens            │
    │                                 │
    │  3. Save caption.txt            │
    │                                 │
    │  4. Emit progress via WebSocket │
    └─────────────────────────────────┘
                │
                ▼
    WebSocket: /ws/progress
    {stage, progress, current_video, tokens, vram}
                │
                ▼
    Frontend: progressStore.updateProgress()
                │
                ▼
    UI updates in real-time
```

### 3. Settings Persistence

```
User changes setting in UI
         │
         ▼
    settingsStore.updateSettings()
         │
         ▼
    POST /api/settings
    {partial settings object}
         │
         ▼
    Backend merges with current settings
         │
         ▼
    Saves to settings.json
         │
         ▼
    Returns updated settings
         │
         ▼
    Store updates local state
```

## Multi-GPU Architecture

### Worker Distribution

When `batch_size > 1` and multiple GPUs are available:

```
                    ProcessingManager
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
      Worker 0        Worker 1        Worker N
      (cuda:0)        (cuda:1)        (cuda:N)
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Model    │    │ Model    │    │ Model    │
    │ Instance │    │ Instance │    │ Instance │
    └──────────┘    └──────────┘    └──────────┘
           │               │               │
           ▼               ▼               ▼
    Process         Process         Process
    video1          video2          video3
```

### Load Balancing

Videos are distributed dynamically:

1. All workers start idle
2. Main loop assigns videos to idle workers
3. When a worker completes, it picks up the next unassigned video
4. Continues until queue is empty
5. Wait for all workers to finish

### Memory Considerations

- Each GPU loads a full model copy (~16GB VRAM)
- Models loaded sequentially to avoid memory spikes
- VRAM tracked per-worker and reported to frontend

## File System Organization

### Working Directory

User-selected directory containing videos:

```
/working_directory/
├── video1.mp4          # Source video
├── video1.txt          # Generated caption
├── video2.avi          # Source video
├── video2.txt          # Generated caption
├── subfolder/          # Subdirectories ignored
│   └── video3.mp4      # Not processed (not in root)
```

### Model Cache

Downloaded models stored locally:

```
/models/
└── Qwen3-VL-8B-Instruct/
    ├── config.json
    ├── model.safetensors
    ├── tokenizer.json
    └── ...
```

### Thumbnail Cache

Generated video thumbnails:

```
/.thumbnail_cache/
├── abc123def.jpg       # Hash-based naming
├── xyz789ghi.jpg       # Prevents regeneration
└── ...
```

## Security Considerations

### Path Traversal Prevention

- Directory setting rejects paths containing `..`
- All file operations validate against working directory
- Absolute paths resolved and checked

### Input Validation

- Pydantic schemas validate all API inputs
- File extension whitelist for video uploads
- Maximum file size limits

### Resource Limits

- WebSocket connection limits
- Processing queue size limits
- Memory monitoring and warnings

## Performance Optimizations

### Backend

1. **SageAttention**: Optimized attention computation (2-5x speedup)
2. **torch.compile**: JIT compilation for inference (10-30% speedup)
3. **Model Caching**: Keep model in memory between processing runs
4. **Async I/O**: Non-blocking file operations where possible

### Frontend

1. **Virtual Scrolling**: Efficient rendering of large video lists
2. **Lazy Loading**: Thumbnails loaded on demand
3. **Debounced Updates**: Settings changes batched to reduce API calls
4. **SSE Streaming**: Progressive video list loading

### Network

1. **Thumbnail Caching**: HTTP cache headers for thumbnails
2. **WebSocket Compression**: Reduced bandwidth for progress updates
3. **JSON Streaming**: Server-sent events for large responses
