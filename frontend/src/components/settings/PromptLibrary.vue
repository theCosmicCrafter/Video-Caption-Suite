<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { BaseButton } from '@/components/base'
import { useApi } from '@/composables/useApi'
import type { SavedPrompt } from '@/types'

interface Props {
  currentPrompt: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  loadPrompt: [prompt: string]
}>()

const api = useApi()
const prompts = ref<SavedPrompt[]>([])
const isOpen = ref(false)
const showSaveDialog = ref(false)
const newPromptName = ref('')
const triggerRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref({ top: 0, left: 0 })

async function loadPrompts() {
  const result = await api.getPrompts()
  if (result) {
    prompts.value = result.prompts
  }
}

function updateDropdownPosition() {
  if (triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect()
    dropdownPosition.value = {
      top: rect.bottom + 4,
      left: rect.left,
    }
  }
}

async function toggleDropdown() {
  isOpen.value = !isOpen.value
  showSaveDialog.value = false
  if (isOpen.value) {
    await nextTick()
    updateDropdownPosition()
  }
}

async function toggleSaveDialog() {
  showSaveDialog.value = !showSaveDialog.value
  isOpen.value = false
  if (showSaveDialog.value) {
    await nextTick()
    updateDropdownPosition()
  }
}

async function handleSavePrompt() {
  if (!newPromptName.value.trim()) return

  const result = await api.createPrompt({
    name: newPromptName.value.trim(),
    prompt: props.currentPrompt,
  })

  if (result) {
    prompts.value.push(result)
    newPromptName.value = ''
    showSaveDialog.value = false
  }
}

async function handleOverwritePrompt(prompt: SavedPrompt, e: Event) {
  e.stopPropagation()
  if (!confirm(`Overwrite "${prompt.name}" with current prompt?`)) return

  const result = await api.updatePrompt(prompt.id, {
    prompt: props.currentPrompt,
  })

  if (result) {
    // Update the prompt in the list
    const index = prompts.value.findIndex((p) => p.id === prompt.id)
    if (index !== -1) {
      prompts.value[index] = result
    }
  }
}

async function handleDeletePrompt(prompt: SavedPrompt, e: Event) {
  e.stopPropagation()
  if (!confirm(`Delete "${prompt.name}"?`)) return

  const success = await api.deletePrompt(prompt.id)
  if (success) {
    prompts.value = prompts.value.filter((p) => p.id !== prompt.id)
  }
}

function handleSelectPrompt(prompt: SavedPrompt) {
  emit('loadPrompt', prompt.prompt)
  isOpen.value = false
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.prompt-library-dropdown') && !target.closest('.prompt-library-trigger')) {
    isOpen.value = false
    showSaveDialog.value = false
  }
}

onMounted(() => {
  loadPrompts()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="triggerRef" class="prompt-library-trigger">
    <div class="flex gap-2">
      <!-- Dropdown button -->
      <button
        class="flex items-center gap-2 px-3 py-1.5 text-sm bg-dark-700 hover:bg-dark-600 rounded transition-colors"
        @click.stop="toggleDropdown"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <span>Library</span>
        <svg
          class="w-3 h-3 transition-transform"
          :class="isOpen && 'rotate-180'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Save current button -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-dark-700 hover:bg-dark-600 rounded transition-colors"
        title="Save current prompt to library"
        @click.stop="toggleSaveDialog"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Save</span>
      </button>
    </div>

    <!-- Teleport dropdowns to body to escape overflow:hidden -->
    <Teleport to="body">
      <!-- Dropdown menu -->
      <div
        v-if="isOpen"
        class="prompt-library-dropdown fixed w-72 bg-dark-800 rounded-lg shadow-xl z-[9999] overflow-hidden"
        :style="{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }"
        @click.stop
      >
        <div v-if="prompts.length === 0" class="px-4 py-6 text-center text-dark-400 text-sm">
          No saved prompts yet.
          <br />
          Click "Save" to save the current prompt.
        </div>

        <div v-else class="max-h-64 overflow-y-auto">
          <button
            v-for="prompt in prompts"
            :key="prompt.id"
            class="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-dark-700 transition-colors group text-left"
            @click="handleSelectPrompt(prompt)"
          >
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-dark-200 truncate">{{ prompt.name }}</div>
              <div class="text-xs text-dark-500 truncate">{{ prompt.prompt.slice(0, 60) }}...</div>
            </div>
            <div class="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
              <!-- Overwrite button -->
              <button
                class="p-1 rounded hover:bg-primary-500/20 hover:text-primary-400 transition-colors"
                title="Overwrite with current prompt"
                @click="handleOverwritePrompt(prompt, $event)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </button>
              <!-- Delete button -->
              <button
                class="p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Delete"
                @click="handleDeletePrompt(prompt, $event)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </button>
        </div>
      </div>

      <!-- Save dialog -->
      <div
        v-if="showSaveDialog"
        class="prompt-library-dropdown fixed w-72 bg-dark-800 rounded-lg shadow-xl z-[9999] p-3"
        :style="{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }"
        @click.stop
      >
        <div class="text-sm font-medium text-dark-200 mb-2">Save Current Prompt</div>
        <div class="flex gap-2">
          <input
            v-model="newPromptName"
            type="text"
            placeholder="Prompt name..."
            class="flex-1 px-2 py-1.5 text-sm bg-dark-700 rounded text-dark-200 placeholder-dark-500 focus:outline-none"
            @keyup.enter="handleSavePrompt"
          />
          <BaseButton
            size="sm"
            :disabled="!newPromptName.trim()"
            @click="handleSavePrompt"
          >
            Save
          </BaseButton>
        </div>
      </div>
    </Teleport>
  </div>
</template>
