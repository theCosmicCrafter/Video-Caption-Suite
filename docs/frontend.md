# Frontend Documentation

This document covers the Vue 3 frontend architecture, components, state management, and development workflow.

## Technology Stack

| Technology    | Version | Purpose                          |
|---------------|---------|----------------------------------|
| Vue 3         | ^3.4    | UI framework (Composition API)   |
| Pinia         | ^2.1    | State management                 |
| TypeScript    | ^5.3    | Type safety                      |
| Tailwind CSS  | ^3.4    | Utility-first styling            |
| Vite          | ^5.0    | Build tool and dev server        |
| Vitest        | ^1.2    | Unit testing                     |
| Heroicons     | ^2.1    | Icon library                     |

## Project Structure

```
frontend/
├── src/
│   ├── components/           # Vue components
│   │   ├── base/            # Reusable UI primitives
│   │   ├── layout/          # App layout components
│   │   ├── video/           # Video-related components
│   │   ├── settings/        # Settings panel components
│   │   ├── progress/        # Progress indicators
│   │   └── caption/         # Caption viewing/editing
│   ├── stores/              # Pinia state stores
│   ├── composables/         # Vue composition utilities
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Helper functions
│   ├── App.vue              # Root component
│   └── main.ts              # Application entry
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── vitest.config.ts         # Test configuration
```

---

## Components

### Component Hierarchy

```
App.vue
├── AppHeader.vue
│   └── Logo, status indicators
├── LayoutSidebar.vue
│   └── SettingsPanel.vue
│       ├── DirectorySettings.vue
│       ├── ModelSettings.vue
│       ├── InferenceSettings.vue
│       ├── OptimizationSettings.vue
│       ├── PromptSettings.vue
│       └── PromptLibrary.vue
├── main content area
│   ├── VideoGridToolbar.vue
│   ├── VideoList.vue
│   │   └── VideoTile.vue (repeated)
│   └── StatusPanel.vue
│       ├── ProgressBar.vue
│       ├── ProgressRing.vue
│       └── StageProgress.vue
└── CaptionPanel.vue (ResizablePanel)
    └── CaptionViewer.vue
```

### Base Components

Reusable UI primitives in `components/base/`:

#### BaseButton.vue

```vue
<template>
  <button
    :class="[
      'px-4 py-2 rounded-md font-medium transition-colors',
      variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
      variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
      disabled && 'opacity-50 cursor-not-allowed'
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>
```

**Props**:
- `variant`: Button style variant
- `disabled`: Disable button interaction

#### BaseInput.vue

Text input with label and validation.

**Props**:
- `modelValue`: Two-way bound value
- `label`: Input label text
- `type`: Input type (text, number, etc.)
- `placeholder`: Placeholder text
- `error`: Error message to display

#### BaseSelect.vue

Dropdown select component.

**Props**:
- `modelValue`: Selected value
- `options`: Array of `{ value, label }` objects
- `label`: Select label text

#### BaseSlider.vue

Range slider with min/max labels.

**Props**:
- `modelValue`: Current value
- `min`: Minimum value
- `max`: Maximum value
- `step`: Step increment
- `label`: Slider label

#### BaseToggle.vue

Toggle switch for boolean values.

**Props**:
- `modelValue`: Boolean state
- `label`: Toggle label
- `description`: Optional description text

#### BaseTextarea.vue

Multi-line text input.

**Props**:
- `modelValue`: Text content
- `label`: Textarea label
- `rows`: Number of visible rows
- `placeholder`: Placeholder text

### Layout Components

#### AppHeader.vue

Top navigation bar with:
- Application logo/title
- Model status indicator
- Processing status indicator

#### LayoutSidebar.vue

Collapsible settings panel container:
- Toggle button to show/hide
- Contains SettingsPanel component
- Persists collapsed state

### Video Components

#### VideoList.vue

Main video grid display:
- Fetches videos from API
- Manages selection state
- Handles infinite scroll (if needed)
- Responds to toolbar actions

**Key Methods**:
```typescript
const loadVideos = async () => {
  // Uses SSE streaming for progressive loading
  const eventSource = new EventSource('/api/videos/stream')
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'video') {
      videos.value.push(data.data)
    }
  }
}
```

#### VideoTile.vue

Individual video card:
- Thumbnail image (lazy loaded)
- Video name
- Duration badge
- Caption status indicator
- Selection checkbox
- Context menu (right-click)

**Template Structure**:
```vue
<template>
  <div
    class="video-tile"
    :class="{ selected: isSelected, captioned: hasCaptioned }"
    @click="toggleSelection"
    @contextmenu.prevent="showContextMenu"
  >
    <div class="thumbnail-container">
      <img :src="thumbnailUrl" :alt="video.name" loading="lazy" />
      <span class="duration-badge">{{ formattedDuration }}</span>
      <div v-if="hasCaptioned" class="caption-indicator">
        <CheckIcon class="w-4 h-4" />
      </div>
    </div>
    <div class="video-info">
      <span class="video-name">{{ video.name }}</span>
    </div>
  </div>
</template>
```

#### VideoGridToolbar.vue

Toolbar above video grid:
- Select All / Deselect All buttons
- Select Uncaptioned button
- Search/filter input
- Sort dropdown
- Refresh button
- Process Selected button

### Settings Components

#### SettingsPanel.vue

Container for all settings sections:
- Accordion-style collapsible sections
- Saves settings on change (debounced)
- Shows GPU information

#### DirectorySettings.vue

Working directory selection:
- Current path display
- Browse button (opens directory browser)
- Directory browser modal

#### ModelSettings.vue

Model configuration:
- Model ID input (readonly, shows current model)
- Device selector (CUDA/CPU)
- Data type selector (float16/bfloat16/float32)

#### InferenceSettings.vue

Caption generation settings:
- Max frames slider (1-256)
- Frame size slider (224-672)
- Max tokens slider (64-2048)
- Temperature slider (0-1)

#### OptimizationSettings.vue

Performance options:
- torch.compile toggle
- SageAttention toggle (with warning)
- Batch size selector (if multi-GPU)

#### PromptSettings.vue

Prompt configuration:
- Prompt textarea
- Character/token count
- Save to Library button
- Load from Library button

#### PromptLibrary.vue

Saved prompts management:
- List of saved prompts
- Load prompt into editor
- Delete prompt
- Rename prompt

### Progress Components

#### StatusPanel.vue

Processing status display:
- Current stage (Loading, Processing, Complete)
- Overall progress bar
- Current video name
- Worker status (multi-GPU)
- Tokens generated
- VRAM usage
- Elapsed time
- Stop button

#### ProgressBar.vue

Horizontal progress bar:

```vue
<template>
  <div class="progress-bar-container">
    <div class="progress-bar-fill" :style="{ width: `${progress}%` }" />
    <span v-if="showLabel" class="progress-label">{{ progress }}%</span>
  </div>
</template>
```

#### ProgressRing.vue

Circular progress indicator:
- SVG-based ring
- Percentage in center
- Animated transitions

#### StageProgress.vue

Multi-stage progress indicator:
- Shows all stages (Load → Process → Complete)
- Highlights current stage
- Shows completed stages with checkmarks

### Caption Components

#### CaptionPanel.vue

Resizable side panel for captions:
- Drag handle for resizing
- Video name header
- Caption content display
- Copy button
- Edit button (if editable)

#### CaptionViewer.vue

Caption content display:
- Scrollable text area
- Word count
- Copy to clipboard
- Optional editing mode

---

## State Management (Pinia)

### Store Overview

```
stores/
├── videoStore.ts      # Video list and selection
├── settingsStore.ts   # App configuration
└── progressStore.ts   # Processing progress
```

### videoStore

Manages video data and selection state.

```typescript
// stores/videoStore.ts
import { defineStore } from 'pinia'
import type { VideoInfo } from '@/types/video'

export const useVideoStore = defineStore('video', {
  state: () => ({
    videos: [] as VideoInfo[],
    selectedVideos: new Set<string>(),
    loading: false,
    loadingProgress: 0,
    currentCaption: null as string | null,
    selectedVideo: null as VideoInfo | null,
  }),

  getters: {
    selectedCount: (state) => state.selectedVideos.size,
    uncaptionedVideos: (state) =>
      state.videos.filter(v => !v.has_caption),
    hasSelection: (state) => state.selectedVideos.size > 0,
  },

  actions: {
    async fetchVideos() {
      this.loading = true
      // Stream videos from API
      // Update loadingProgress as videos arrive
    },

    toggleVideoSelection(name: string) {
      if (this.selectedVideos.has(name)) {
        this.selectedVideos.delete(name)
      } else {
        this.selectedVideos.add(name)
      }
    },

    selectAll() {
      this.videos.forEach(v => this.selectedVideos.add(v.name))
    },

    deselectAll() {
      this.selectedVideos.clear()
    },

    selectUncaptioned() {
      this.deselectAll()
      this.uncaptionedVideos.forEach(v =>
        this.selectedVideos.add(v.name)
      )
    },

    async deleteCaption(videoName: string) {
      await api.deleteCaption(videoName)
      const video = this.videos.find(v => v.name === videoName)
      if (video) video.has_caption = false
    },
  },
})
```

### settingsStore

Manages application settings.

```typescript
// stores/settingsStore.ts
import { defineStore } from 'pinia'
import type { Settings, GPUInfo } from '@/types/settings'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null as Settings | null,
    gpuInfo: null as GPUInfo | null,
    loading: false,
    saving: false,
  }),

  getters: {
    hasMultiGPU: (state) => (state.gpuInfo?.count ?? 0) > 1,
    maxBatchSize: (state) => Math.min(state.gpuInfo?.count ?? 1, 8),
    isLoaded: (state) => state.settings !== null,
  },

  actions: {
    async fetchSettings() {
      this.loading = true
      try {
        this.settings = await api.getSettings()
      } finally {
        this.loading = false
      }
    },

    async updateSettings(partial: Partial<Settings>) {
      this.saving = true
      try {
        this.settings = await api.updateSettings(partial)
      } finally {
        this.saving = false
      }
    },

    async resetSettings() {
      this.settings = await api.resetSettings()
    },

    async fetchGPUInfo() {
      this.gpuInfo = await api.getGPUInfo()
    },
  },
})
```

### progressStore

Manages processing progress state.

```typescript
// stores/progressStore.ts
import { defineStore } from 'pinia'
import type { ProgressUpdate, ProcessingStage } from '@/types/progress'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    stage: 'IDLE' as ProcessingStage,
    substage: 'IDLE',
    progress: 0,
    currentVideo: null as string | null,
    currentIndex: 0,
    totalVideos: 0,
    tokensGenerated: 0,
    tokensPerSecond: 0,
    vramUsedMb: 0,
    elapsedSeconds: 0,
    workers: [] as WorkerProgress[],
    wsConnected: false,
    error: null as string | null,
  }),

  getters: {
    isProcessing: (state) =>
      ['LOADING_MODEL', 'PROCESSING'].includes(state.stage),
    isComplete: (state) => state.stage === 'COMPLETE',
    isIdle: (state) => state.stage === 'IDLE',
    hasError: (state) => state.stage === 'ERROR',
  },

  actions: {
    updateProgress(update: ProgressUpdate) {
      Object.assign(this, update)
    },

    resetProgress() {
      this.stage = 'IDLE'
      this.progress = 0
      this.currentVideo = null
      this.error = null
    },

    setConnected(connected: boolean) {
      this.wsConnected = connected
    },
  },
})
```

---

## Composables

### useApi

HTTP request utilities and API methods.

```typescript
// composables/useApi.ts
export function useApi() {
  const baseUrl = '/api'

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return response.json()
  }

  return {
    // Settings
    getSettings: () => request<Settings>('/settings'),
    updateSettings: (data: Partial<Settings>) =>
      request<Settings>('/settings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Videos
    getVideos: () => request<{ videos: VideoInfo[] }>('/videos'),
    deleteVideo: (name: string) =>
      request(`/videos/${name}`, { method: 'DELETE' }),

    // Processing
    startProcessing: (videos: string[], prompt?: string) =>
      request('/process/start', {
        method: 'POST',
        body: JSON.stringify({ videos, prompt }),
      }),
    stopProcessing: () =>
      request('/process/stop', { method: 'POST' }),

    // Model
    loadModel: () => request('/model/load', { method: 'POST' }),
    unloadModel: () => request('/model/unload', { method: 'POST' }),
    getModelStatus: () => request<ModelStatus>('/model/status'),

    // Prompts
    getPrompts: () => request<SavedPrompt[]>('/prompts'),
    createPrompt: (data: { name: string; prompt: string }) =>
      request<SavedPrompt>('/prompts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deletePrompt: (id: string) =>
      request(`/prompts/${id}`, { method: 'DELETE' }),
  }
}
```

### useWebSocket

WebSocket connection management.

```typescript
// composables/useWebSocket.ts
export function useWebSocket() {
  const progressStore = useProgressStore()
  let ws: WebSocket | null = null
  let reconnectTimer: number | null = null

  function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    ws = new WebSocket(`${protocol}//${window.location.host}/ws/progress`)

    ws.onopen = () => {
      progressStore.setConnected(true)
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'progress') {
        progressStore.updateProgress(data.data)
      } else if (data.type === 'complete') {
        progressStore.updateProgress({ stage: 'COMPLETE', ...data.data })
      } else if (data.type === 'error') {
        progressStore.updateProgress({ stage: 'ERROR', error: data.data.message })
      }
    }

    ws.onclose = () => {
      progressStore.setConnected(false)
      // Attempt reconnection
      reconnectTimer = setTimeout(connect, 3000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  function disconnect() {
    if (ws) {
      ws.close()
      ws = null
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }
  }

  return { connect, disconnect }
}
```

### useResizable

Draggable panel resizing.

```typescript
// composables/useResizable.ts
export function useResizable(options: {
  minWidth: number
  maxWidth: number
  initialWidth: number
}) {
  const width = ref(options.initialWidth)
  const isDragging = ref(false)

  function startDrag(event: MouseEvent) {
    isDragging.value = true
    const startX = event.clientX
    const startWidth = width.value

    function onMouseMove(e: MouseEvent) {
      const delta = startX - e.clientX
      const newWidth = Math.max(
        options.minWidth,
        Math.min(options.maxWidth, startWidth + delta)
      )
      width.value = newWidth
    }

    function onMouseUp() {
      isDragging.value = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return { width, isDragging, startDrag }
}
```

---

## TypeScript Types

### types/video.ts

```typescript
export interface VideoInfo {
  name: string
  path: string
  size: number
  duration: number | null
  width: number | null
  height: number | null
  fps: number | null
  frame_count: number | null
  has_caption: boolean
  modified_at: string
}

export interface CaptionInfo {
  name: string
  video_name: string
  content: string
  created_at: string
}
```

### types/settings.ts

```typescript
export interface Settings {
  model_id: string
  device: 'cuda' | 'cpu'
  dtype: 'float16' | 'bfloat16' | 'float32'
  max_frames: number
  frame_size: number
  max_tokens: number
  temperature: number
  use_torch_compile: boolean
  use_sage_attention: boolean
  working_directory: string
  prompt: string
  batch_size: number
}

export interface GPUInfo {
  gpus: Array<{
    index: number
    name: string
    memory_total: number
    memory_free: number
  }>
  count: number
  cuda_available: boolean
}
```

### types/progress.ts

```typescript
export type ProcessingStage =
  | 'IDLE'
  | 'LOADING_MODEL'
  | 'PROCESSING'
  | 'COMPLETE'
  | 'ERROR'

export type ProcessingSubstage =
  | 'IDLE'
  | 'EXTRACTING_FRAMES'
  | 'ENCODING'
  | 'GENERATING'

export interface WorkerProgress {
  device: string
  status: 'idle' | 'processing' | 'complete' | 'error'
  current_video: string | null
  progress: number
  videos_completed: number
}

export interface ProgressUpdate {
  stage: ProcessingStage
  substage?: ProcessingSubstage
  progress: number
  current_video: string | null
  current_index: number
  total_videos: number
  tokens_generated: number
  tokens_per_second: number
  vram_used_mb: number
  elapsed_seconds: number
  workers?: WorkerProgress[]
}
```

---

## Development

### Setup

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

Runs on `http://localhost:5173` with hot reload.
API requests are proxied to `http://localhost:8000`.

### Build

```bash
npm run build
```

Output in `dist/` directory.

### Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Linting

```bash
# Check for issues
npm run lint

# Fix automatically
npm run lint:fix
```

### Type Checking

```bash
npm run type-check
```

---

## Configuration Files

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### tailwind.config.js

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

---

## Best Practices

### Component Guidelines

1. **Use Composition API** with `<script setup>`
2. **Type props and emits** using TypeScript generics
3. **Keep components focused** - single responsibility
4. **Use computed properties** for derived state
5. **Avoid direct store mutations** - use actions

### State Management

1. **Colocate state** - keep state close to where it's used
2. **Use stores for shared state** only
3. **Prefer getters** over computed in components
4. **Debounce settings updates** to reduce API calls

### Performance

1. **Lazy load components** where appropriate
2. **Use `v-once`** for static content
3. **Virtualize long lists** (VirtualGrid)
4. **Debounce expensive operations**
5. **Use `shallowRef`** for large objects
