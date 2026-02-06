<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CaptionInfo, VideoInfo } from '@/types'
import { BaseButton } from '@/components/base'

interface Props {
  video: VideoInfo | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  delete: [videoName: string]
}>()

const caption = ref<CaptionInfo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const copied = ref(false)

const hasCaption = computed(() => props.video?.has_caption ?? false)

async function fetchCaption() {
  if (!props.video?.name || !hasCaption.value) {
    caption.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/api/captions/${encodeURIComponent(props.video.name)}`)
    if (!response.ok) throw new Error('Failed to load caption')
    caption.value = await response.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

async function copyToClipboard() {
  if (caption.value) {
    await navigator.clipboard.writeText(caption.value.caption_text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function handleDelete() {
  if (props.video?.name && confirm('Delete this caption?')) {
    emit('delete', props.video.name)
  }
}

watch(() => props.video?.name, () => {
  if (props.video) {
    fetchCaption()
  } else {
    caption.value = null
  }
}, { immediate: true })
</script>

<template>
  <div class="caption-panel h-full flex flex-col bg-dark-850">
    <!-- Header -->
    <div class="flex-shrink-0 flex items-center justify-between px-4 py-3">
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-semibold text-dark-200 truncate">Caption</h3>
        <p v-if="video" class="text-xs text-dark-500 truncate mt-0.5" :title="video.name">
          {{ video.name }}
        </p>
      </div>
      <button
        class="flex-shrink-0 ml-2 p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-200 transition-colors"
        @click="emit('close')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- No video selected -->
      <div v-if="!video" class="h-full flex items-center justify-center">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto text-dark-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm text-dark-500">Select a video with a caption</p>
        </div>
      </div>

      <!-- No caption yet -->
      <div v-else-if="!hasCaption" class="h-full flex items-center justify-center">
        <div class="text-center">
          <svg class="w-12 h-12 mx-auto text-dark-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-dark-500">No caption generated yet</p>
          <p class="text-xs text-dark-600 mt-1">Process this video to generate a caption</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-else-if="loading" class="h-full flex items-center justify-center">
        <svg class="w-6 h-6 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-3 bg-red-900/30 rounded-lg text-red-400 text-sm">
        {{ error }}
      </div>

      <!-- Caption text -->
      <div v-else-if="caption" class="space-y-3">
        <pre class="whitespace-pre-wrap font-sans text-dark-300 text-sm leading-relaxed">{{ caption.caption_text }}</pre>
      </div>
    </div>

    <!-- Footer actions -->
    <div v-if="video && hasCaption && caption" class="flex-shrink-0 px-4 py-3">
      <div class="flex items-center gap-2">
        <BaseButton
          variant="secondary"
          size="sm"
          class="flex-1"
          @click="copyToClipboard"
        >
          <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!copied" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 13l4 4L19 7" />
          </svg>
          {{ copied ? 'Copied!' : 'Copy' }}
        </BaseButton>
        <BaseButton
          variant="danger"
          size="sm"
          @click="handleDelete"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </BaseButton>
      </div>
      <p v-if="caption.created_at" class="text-[10px] text-dark-600 mt-2 text-center">
        Created {{ new Date(caption.created_at).toLocaleString() }}
      </p>
    </div>
  </div>
</template>
