export type MediaType = 'video' | 'image'

export interface VideoInfo {
  name: string
  path: string
  size_mb: number
  media_type: MediaType
  duration_sec: number | null
  width: number | null
  height: number | null
  frame_count: number | null
  fps: number | null
  has_caption: boolean
  caption_preview: string | null
}

export interface CaptionInfo {
  video_name: string
  caption_path: string
  caption_text: string
  created_at: string | null
}

export type VideoStatus = 'pending' | 'processing' | 'complete' | 'error'

export interface VideoWithStatus extends VideoInfo {
  status: VideoStatus
  error?: string
}
