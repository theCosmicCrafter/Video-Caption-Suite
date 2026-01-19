# Development Guide

This guide covers development setup, contributing guidelines, testing, and extending Video Caption Suite.

## Development Environment Setup

### Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend development)
- NVIDIA GPU with CUDA (for model testing)
- Git

### Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-repo/video-caption-suite.git
cd video-caption-suite

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install development dependencies
pip install pytest pytest-asyncio httpx black isort flake8

# Setup frontend
cd frontend
npm install
cd ..
```

### Running in Development Mode

**Backend (with auto-reload)**:
```bash
python -m uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (with hot-reload)**:
```bash
cd frontend
npm run dev
```

Frontend dev server runs on `http://localhost:5173` and proxies API requests to `http://localhost:8000`.

---

## Project Architecture

### Directory Overview

```
video-caption-suite/
├── backend/                 # Python backend
│   ├── api.py              # FastAPI routes
│   ├── processing.py       # Processing manager
│   ├── gpu_utils.py        # GPU utilities
│   ├── schemas.py          # Pydantic models
│   └── tests/              # Backend tests
├── frontend/               # Vue.js frontend
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── stores/         # Pinia stores
│   │   ├── composables/    # Composition functions
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilities
│   └── ...
├── config.py               # Global configuration
├── model_loader.py         # Model management
├── video_processor.py      # Frame extraction
├── requirements.txt        # Python dependencies
└── docs/                   # Documentation
```

### Key Modules

| Module              | Purpose                                |
|---------------------|----------------------------------------|
| `backend/api.py`    | REST API endpoints, WebSocket server   |
| `backend/processing.py` | Multi-GPU processing orchestration |
| `model_loader.py`   | Model loading and caption generation   |
| `video_processor.py`| Video frame extraction                 |
| `config.py`         | Default configuration values           |

---

## Code Style

### Python

We follow PEP 8 with some modifications:

- Line length: 100 characters
- Use type hints for function signatures
- Use docstrings for public functions

**Formatting Tools**:
```bash
# Format with black
black . --line-length 100

# Sort imports
isort . --profile black --line-length 100

# Lint
flake8 . --max-line-length 100
```

**Example Style**:
```python
from typing import Optional, List
from pathlib import Path

def process_video(
    video_path: Path,
    max_frames: int = 128,
    frame_size: int = 336,
) -> Optional[str]:
    """
    Process a video and generate a caption.

    Args:
        video_path: Path to the video file
        max_frames: Maximum frames to extract
        frame_size: Maximum frame dimension

    Returns:
        Generated caption or None if processing fails
    """
    # Implementation
    pass
```

### TypeScript/Vue

- Use Composition API with `<script setup>`
- Type all props and emits
- Use PascalCase for components
- Use camelCase for variables and functions

**Example Component**:
```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { VideoInfo } from '@/types/video'

const props = defineProps<{
  video: VideoInfo
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [name: string]
  delete: [name: string]
}>()

const formattedDuration = computed(() => {
  if (!props.video.duration) return '--:--'
  const mins = Math.floor(props.video.duration / 60)
  const secs = Math.floor(props.video.duration % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
})
</script>

<template>
  <div
    :class="['video-tile', { selected }]"
    @click="emit('select', video.name)"
  >
    <!-- template content -->
  </div>
</template>
```

---

## Testing

### Backend Tests

Tests are located in `backend/tests/`.

**Run all tests**:
```bash
pytest backend/tests/ -v
```

**Run with coverage**:
```bash
pytest backend/tests/ --cov=backend --cov-report=html
```

**Example Test**:
```python
# backend/tests/test_api.py
import pytest
from httpx import AsyncClient
from backend.api import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_get_settings(client):
    response = await client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert "model_id" in data
    assert "max_frames" in data

@pytest.mark.asyncio
async def test_update_settings(client):
    response = await client.post(
        "/api/settings",
        json={"max_frames": 64}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["max_frames"] == 64
```

### Frontend Tests

Tests use Vitest.

**Run tests**:
```bash
cd frontend
npm run test
```

**Run with coverage**:
```bash
npm run test:coverage
```

**Example Test**:
```typescript
// frontend/src/components/__tests__/VideoTile.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoTile from '../video/VideoTile.vue'

describe('VideoTile', () => {
  const mockVideo = {
    name: 'test.mp4',
    path: '/videos/test.mp4',
    duration: 125,
    has_caption: false,
  }

  it('renders video name', () => {
    const wrapper = mount(VideoTile, {
      props: { video: mockVideo }
    })
    expect(wrapper.text()).toContain('test.mp4')
  })

  it('shows duration badge', () => {
    const wrapper = mount(VideoTile, {
      props: { video: mockVideo }
    })
    expect(wrapper.find('.duration-badge').text()).toBe('2:05')
  })

  it('emits select on click', async () => {
    const wrapper = mount(VideoTile, {
      props: { video: mockVideo }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
  })
})
```

---

## Adding New Features

### Adding a New API Endpoint

1. **Define schema** in `backend/schemas.py`:
```python
class NewFeatureRequest(BaseModel):
    param1: str
    param2: int = 10

class NewFeatureResponse(BaseModel):
    result: str
    status: str
```

2. **Add endpoint** in `backend/api.py`:
```python
@app.post("/api/new-feature", response_model=NewFeatureResponse)
async def new_feature(request: NewFeatureRequest):
    # Implementation
    result = do_something(request.param1, request.param2)
    return NewFeatureResponse(result=result, status="success")
```

3. **Add API method** in frontend `composables/useApi.ts`:
```typescript
newFeature: (param1: string, param2: number) =>
  request<NewFeatureResponse>('/new-feature', {
    method: 'POST',
    body: JSON.stringify({ param1, param2 }),
  }),
```

4. **Add types** in `frontend/src/types/`:
```typescript
export interface NewFeatureRequest {
  param1: string
  param2: number
}

export interface NewFeatureResponse {
  result: string
  status: string
}
```

5. **Write tests** for both backend and frontend

### Adding a New Settings Option

1. **Add to config.py**:
```python
NEW_OPTION = True  # Default value
```

2. **Add to schemas.py** Settings model:
```python
class Settings(BaseModel):
    # existing fields...
    new_option: bool = True
```

3. **Update frontend types**:
```typescript
interface Settings {
  // existing fields...
  new_option: boolean
}
```

4. **Add UI control** in appropriate settings component:
```vue
<BaseToggle
  v-model="settings.new_option"
  label="New Option"
  description="Description of what this does"
/>
```

### Adding a New Vue Component

1. **Create component file**:
```
frontend/src/components/feature/NewComponent.vue
```

2. **Define props and emits**:
```vue
<script setup lang="ts">
defineProps<{
  propName: string
}>()

defineEmits<{
  eventName: [payload: string]
}>()
</script>
```

3. **Import and use** in parent component:
```vue
<script setup>
import NewComponent from '@/components/feature/NewComponent.vue'
</script>

<template>
  <NewComponent prop-name="value" @event-name="handleEvent" />
</template>
```

4. **Write tests** in `__tests__/NewComponent.spec.ts`

---

## Debugging

### Backend Debugging

**Enable debug logging**:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Use breakpoints with debugpy**:
```python
import debugpy
debugpy.listen(5678)
debugpy.wait_for_client()  # Pauses until debugger attaches
```

**VS Code launch.json**:
```json
{
  "name": "Python: FastAPI",
  "type": "python",
  "request": "attach",
  "connect": {
    "host": "localhost",
    "port": 5678
  }
}
```

### Frontend Debugging

**Vue DevTools**: Install browser extension for component inspection.

**Console logging**:
```typescript
import { watch } from 'vue'

watch(someRef, (newVal) => {
  console.log('someRef changed:', newVal)
})
```

**Vite debug mode**:
```bash
DEBUG=vite:* npm run dev
```

### WebSocket Debugging

**Browser DevTools**: Network tab → WS filter → inspect messages.

**Manual testing**:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/progress')
ws.onmessage = (e) => console.log(JSON.parse(e.data))
```

---

## Performance Optimization

### Backend

1. **Profile code**:
```python
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()
# Code to profile
profiler.disable()
stats = pstats.Stats(profiler).sort_stats('cumtime')
stats.print_stats(20)
```

2. **Monitor VRAM**:
```python
import torch

def log_vram():
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated() / 1e9
        reserved = torch.cuda.memory_reserved() / 1e9
        print(f"VRAM: {allocated:.2f}GB allocated, {reserved:.2f}GB reserved")
```

3. **Use async where possible**:
```python
async def process_batch(videos: List[str]):
    tasks = [process_video(v) for v in videos]
    results = await asyncio.gather(*tasks)
    return results
```

### Frontend

1. **Vue DevTools Performance tab**: Identify slow components.

2. **Lighthouse audit**: `npm run build && npx serve dist`

3. **Bundle analysis**:
```bash
npm run build -- --report
```

---

## Release Process

### Version Bump

1. Update version in `package.json`
2. Update changelog
3. Create git tag

### Build

```bash
# Backend: no build needed

# Frontend
cd frontend
npm run build
```

### Testing Checklist

- [ ] All unit tests pass
- [ ] Manual testing of key features
- [ ] Test on fresh installation
- [ ] Test multi-GPU if available
- [ ] Check memory usage
- [ ] Verify settings persistence

### Release

1. Create GitHub release
2. Attach built frontend (if distributing)
3. Update documentation

---

## Common Issues

### Import Errors

```bash
# Ensure virtual environment is active
source venv/bin/activate  # or .\venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000  # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Kill process or use different port
python -m uvicorn backend.api:app --port 8001
```

### CUDA Errors

```python
# Check CUDA availability
import torch
print(torch.cuda.is_available())
print(torch.version.cuda)

# Clear CUDA cache
torch.cuda.empty_cache()
```

### Frontend Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

## Contributing

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes with tests
4. Run linting and tests
5. Commit with descriptive message
6. Push and create PR

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(api): add batch delete endpoint
fix(frontend): resolve thumbnail loading race condition
docs(readme): update installation instructions
```

### Code Review Guidelines

- All PRs require at least one review
- Tests must pass
- No linting errors
- Documentation updated if needed
