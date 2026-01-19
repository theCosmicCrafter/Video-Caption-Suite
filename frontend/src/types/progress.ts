export type ProcessingStage = 'idle' | 'loading_model' | 'processing' | 'complete' | 'error'
export type ProcessingSubstage = 'idle' | 'extracting_frames' | 'encoding' | 'generating'

export interface WorkerProgress {
  worker_id: number
  device: string
  current_video: string | null
  substage: ProcessingSubstage
  substage_progress: number
}

export interface ProgressState {
  stage: ProcessingStage
  current_video: string | null
  video_index: number
  total_videos: number
  tokens_generated: number
  tokens_per_sec: number
  model_loaded: boolean
  vram_used_gb: number
  substage: ProcessingSubstage
  substage_progress: number
  error_message: string | null
  elapsed_time: number
  // Multi-GPU fields
  batch_size: number
  workers: WorkerProgress[]
  completed_videos: number
}

export const initialProgressState: ProgressState = {
  stage: 'idle',
  current_video: null,
  video_index: 0,
  total_videos: 0,
  tokens_generated: 0,
  tokens_per_sec: 0,
  model_loaded: false,
  vram_used_gb: 0,
  substage: 'idle',
  substage_progress: 0,
  error_message: null,
  elapsed_time: 0,
  // Multi-GPU fields
  batch_size: 1,
  workers: [],
  completed_videos: 0,
}
