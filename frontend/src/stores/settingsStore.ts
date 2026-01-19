import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Settings, SettingsUpdate, SystemGPUInfo } from '@/types'
import { defaultSettings } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({ ...defaultSettings })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const gpuInfo = ref<SystemGPUInfo | null>(null)

  const hasChanges = computed(() => {
    return JSON.stringify(settings.value) !== JSON.stringify(defaultSettings)
  })

  const hasMultiGPU = computed(() => (gpuInfo.value?.gpu_count ?? 0) > 1)
  const maxBatchSize = computed(() => gpuInfo.value?.max_batch_size ?? 1)

  async function fetchGPUInfo() {
    try {
      const response = await fetch('/api/system/gpu')
      if (!response.ok) throw new Error('Failed to fetch GPU info')
      gpuInfo.value = await response.json()
    } catch (e) {
      console.error('Failed to fetch GPU info:', e)
    }
  }

  async function fetchSettings() {
    loading.value = true
    error.value = null

    try {
      // Fetch GPU info first
      await fetchGPUInfo()

      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      settings.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  async function updateSettings(update: SettingsUpdate) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      })
      if (!response.ok) throw new Error('Failed to update settings')
      settings.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function resetSettings() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/settings/reset', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to reset settings')
      settings.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    } finally {
      loading.value = false
    }
  }

  function setLocalSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    settings.value[key] = value
  }

  return {
    settings,
    loading,
    error,
    gpuInfo,
    hasChanges,
    hasMultiGPU,
    maxBatchSize,
    fetchSettings,
    fetchGPUInfo,
    updateSettings,
    resetSettings,
    setLocalSetting,
  }
})
