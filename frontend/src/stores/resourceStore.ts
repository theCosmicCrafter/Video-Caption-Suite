import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ResourceSnapshot, GPUMetrics } from '@/types'
import { initialResourceSnapshot } from '@/types'

export const useResourceStore = defineStore('resources', () => {
  const snapshot = ref<ResourceSnapshot>({ ...initialResourceSnapshot })
  const connected = ref(false)

  const cpuPercent = computed(() => Math.round(snapshot.value.cpu_percent))

  const ramPercent = computed(() => {
    if (snapshot.value.ram_total_gb === 0) return 0
    return Math.round((snapshot.value.ram_used_gb / snapshot.value.ram_total_gb) * 100)
  })

  const ramDisplay = computed(() => {
    return `${snapshot.value.ram_used_gb.toFixed(1)}/${snapshot.value.ram_total_gb.toFixed(0)}GB`
  })

  const hasGPU = computed(() => snapshot.value.gpus.length > 0)

  const primaryGpu = computed<GPUMetrics | null>(() => {
    return snapshot.value.gpus.length > 0 ? snapshot.value.gpus[0] : null
  })

  const gpuUtilPercent = computed(() => {
    if (!primaryGpu.value) return 0
    return Math.round(primaryGpu.value.utilization_percent)
  })

  const vramDisplay = computed(() => {
    if (!primaryGpu.value) return null
    return `${primaryGpu.value.vram_used_gb.toFixed(1)}/${primaryGpu.value.vram_total_gb.toFixed(0)}GB`
  })

  const gpuTemp = computed(() => {
    if (!primaryGpu.value) return null
    return primaryGpu.value.temperature_c
  })

  const tempColor = computed(() => {
    const temp = gpuTemp.value
    if (temp === null) return 'text-dark-500'
    if (temp < 60) return 'text-green-400'
    if (temp < 80) return 'text-yellow-400'
    return 'text-red-400'
  })

  function update(data: ResourceSnapshot) {
    snapshot.value = data
  }

  function setConnected(value: boolean) {
    connected.value = value
  }

  return {
    snapshot,
    connected,
    cpuPercent,
    ramPercent,
    ramDisplay,
    hasGPU,
    primaryGpu,
    gpuUtilPercent,
    vramDisplay,
    gpuTemp,
    tempColor,
    update,
    setConnected,
  }
})
