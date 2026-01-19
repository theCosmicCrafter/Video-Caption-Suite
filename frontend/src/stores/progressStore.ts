import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProgressState, ProcessingStage } from '@/types'
import { initialProgressState } from '@/types'

export const useProgressStore = defineStore('progress', () => {
  const state = ref<ProgressState>({ ...initialProgressState })
  const wsConnected = ref(false)

  const isIdle = computed(() => state.value.stage === 'idle')
  const isLoadingModel = computed(() => state.value.stage === 'loading_model')
  const isProcessing = computed(() => state.value.stage === 'processing')
  const isComplete = computed(() => state.value.stage === 'complete')
  const hasError = computed(() => state.value.stage === 'error')

  const isMultiGPU = computed(() => state.value.batch_size > 1)

  const overallProgress = computed(() => {
    if (state.value.total_videos === 0) return 0

    // For multi-GPU: use completed_videos for accurate tracking
    const completedProgress = state.value.completed_videos / state.value.total_videos

    // Add partial progress from active workers
    let activeProgress = 0
    if (state.value.workers && state.value.workers.length > 0) {
      const activeWorkers = state.value.workers.filter(w => w.current_video)
      activeProgress = activeWorkers.reduce((sum, w) => sum + w.substage_progress, 0)
        / state.value.total_videos
    } else {
      // Single GPU fallback
      activeProgress = state.value.substage_progress / state.value.total_videos
    }

    return Math.min(100, (completedProgress + activeProgress) * 100)
  })

  const currentVideoProgress = computed(() => {
    return state.value.substage_progress * 100
  })

  const formattedElapsedTime = computed(() => {
    const seconds = Math.floor(state.value.elapsed_time)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  })

  const estimatedTimeRemaining = computed(() => {
    // Use completed_videos for multi-GPU, video_index for single GPU
    const completedCount = state.value.completed_videos > 0
      ? state.value.completed_videos
      : state.value.video_index

    if (completedCount === 0 || state.value.elapsed_time === 0) return null

    const avgTimePerVideo = state.value.elapsed_time / completedCount
    const remainingVideos = state.value.total_videos - completedCount
    const remainingSeconds = Math.floor(avgTimePerVideo * remainingVideos)

    const mins = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  })

  function updateFromWebSocket(data: ProgressState) {
    state.value = { ...state.value, ...data }
  }

  function setWsConnected(connected: boolean) {
    wsConnected.value = connected
  }

  function reset() {
    state.value = { ...initialProgressState }
  }

  return {
    state,
    wsConnected,
    isIdle,
    isLoadingModel,
    isProcessing,
    isComplete,
    hasError,
    isMultiGPU,
    overallProgress,
    currentVideoProgress,
    formattedElapsedTime,
    estimatedTimeRemaining,
    updateFromWebSocket,
    setWsConnected,
    reset,
  }
})
