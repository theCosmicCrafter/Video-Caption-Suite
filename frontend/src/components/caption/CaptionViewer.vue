<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CaptionInfo } from '@/types'
import { BaseButton } from '@/components/base'

interface Props {
  visible: boolean
  videoName: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  delete: [videoName: string]
}>()

const caption = ref<CaptionInfo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function fetchCaption() {
  if (!props.videoName) return

  loading.value = true
  error.value = null

  try {
    const response = await fetch(`/api/captions/${encodeURIComponent(props.videoName)}`)
    if (!response.ok) throw new Error('Failed to load caption')
    caption.value = await response.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

function copyToClipboard() {
  if (caption.value) {
    navigator.clipboard.writeText(caption.value.caption_text)
  }
}

function handleDelete() {
  if (props.videoName && confirm('Delete this caption?')) {
    emit('delete', props.videoName)
  }
}

watch(() => props.visible, (visible) => {
  if (visible && props.videoName) {
    fetchCaption()
  } else {
    caption.value = null
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/70"
          @click="emit('close')"
        />

        <!-- Modal -->
        <div class="relative w-full max-w-3xl max-h-[80vh] bg-dark-800 rounded-xl shadow-2xl flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4">
            <div>
              <h3 class="text-lg font-semibold text-dark-100">Caption</h3>
              <p class="text-sm text-dark-400">{{ videoName }}</p>
            </div>
            <button
              class="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-200"
              @click="emit('close')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-12">
              <svg class="w-8 h-8 text-primary-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="p-4 bg-red-900/30 rounded-lg text-red-400">
              {{ error }}
            </div>

            <!-- Caption text -->
            <div v-else-if="caption" class="prose prose-invert max-w-none">
              <pre class="whitespace-pre-wrap font-sans text-dark-200 text-sm leading-relaxed">{{ caption.caption_text }}</pre>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-4">
            <div class="text-xs text-dark-500">
              <span v-if="caption?.created_at">
                Created: {{ new Date(caption.created_at).toLocaleString() }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <BaseButton
                variant="danger"
                size="sm"
                @click="handleDelete"
              >
                Delete
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="sm"
                @click="copyToClipboard"
              >
                Copy
              </BaseButton>
              <BaseButton
                variant="primary"
                size="sm"
                @click="emit('close')"
              >
                Close
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
