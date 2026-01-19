export type DeviceType = 'cuda' | 'cpu'
export type DtypeType = 'float16' | 'bfloat16' | 'float32'

export interface Settings {
  model_id: string
  device: DeviceType
  dtype: DtypeType
  max_frames: number
  frame_size: number
  max_tokens: number
  temperature: number
  use_sage_attention: boolean
  use_torch_compile: boolean
  include_metadata: boolean
  batch_size: number
  prompt: string
}

export interface SettingsUpdate {
  model_id?: string
  device?: DeviceType
  dtype?: DtypeType
  max_frames?: number
  frame_size?: number
  max_tokens?: number
  temperature?: number
  use_sage_attention?: boolean
  use_torch_compile?: boolean
  include_metadata?: boolean
  batch_size?: number
  prompt?: string
}

export const defaultSettings: Settings = {
  model_id: 'Qwen/Qwen3-VL-8B-Instruct',
  device: 'cuda',
  dtype: 'bfloat16',
  max_frames: 16,
  frame_size: 336,
  max_tokens: 512,
  temperature: 0.3,
  use_sage_attention: false,
  use_torch_compile: true,
  include_metadata: false,
  batch_size: 1,
  prompt: `Describe this video in detail. Include:
- The main subject and their actions
- The setting and environment
- Any notable objects or elements
- The overall mood or atmosphere
- Any text visible in the video`,
}

// GPU info types
export interface GPUInfo {
  index: number
  name: string
  memory_total_gb: number
  memory_free_gb: number
  device: string
}

export interface SystemGPUInfo {
  gpu_count: number
  gpus: GPUInfo[]
  cuda_available: boolean
  cuda_version: string | null
  max_batch_size: number
}

// Prompt Library types
export interface SavedPrompt {
  id: string
  name: string
  prompt: string
  created_at: string
}

export interface PromptLibrary {
  prompts: SavedPrompt[]
}

export interface CreatePromptRequest {
  name: string
  prompt: string
}

export interface UpdatePromptRequest {
  name?: string
  prompt?: string
}

// Directory types
export interface DirectoryRequest {
  directory: string
  traverse_subfolders?: boolean
}

export interface DirectoryResponse {
  directory: string
  video_count?: number
  traverse_subfolders?: boolean
}

export interface DirectoryBrowseResponse {
  current: string
  parent: string | null
  directories: { name: string; path: string }[]
}
