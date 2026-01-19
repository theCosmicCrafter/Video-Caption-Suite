<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'
import { BaseToggle, BaseSlider } from '@/components/base'

const settingsStore = useSettingsStore()
const { settings, hasMultiGPU, maxBatchSize, gpuInfo } = storeToRefs(settingsStore)

function updateBatchSize(value: number) {
  settingsStore.setLocalSetting('batch_size', value)
}

function updateSageAttention(value: boolean) {
  settingsStore.setLocalSetting('use_sage_attention', value)
}

function updateTorchCompile(value: boolean) {
  settingsStore.setLocalSetting('use_torch_compile', value)
}

function updateIncludeMetadata(value: boolean) {
  settingsStore.setLocalSetting('include_metadata', value)
}

function formatBatchSize(value: number): string {
  return `${value} GPU${value > 1 ? 's' : ''}`
}
</script>

<template>
  <div class="space-y-4">
    <!-- Multi-GPU Batch Size (only shown when gpu_count > 1) -->
    <div v-if="hasMultiGPU" class="space-y-2">
      <BaseSlider
        :model-value="settings.batch_size"
        label="Parallel Workers (GPUs)"
        :min="1"
        :max="maxBatchSize"
        :step="1"
        :format-value="formatBatchSize"
        @update:model-value="updateBatchSize"
      />
      <p class="text-xs text-dark-400">
        Process {{ settings.batch_size }} video{{ settings.batch_size > 1 ? 's' : '' }}
        simultaneously across {{ gpuInfo?.gpu_count }} available GPUs
      </p>
    </div>

    <BaseToggle
      :model-value="settings.use_torch_compile"
      label="torch.compile"
      description="10-30% faster after warmup"
      @update:model-value="updateTorchCompile"
    />

    <BaseToggle
      :model-value="settings.use_sage_attention"
      label="SageAttention"
      description="Not compatible with Qwen3-VL (head dim 80)"
      :disabled="true"
      @update:model-value="updateSageAttention"
    />

    <BaseToggle
      :model-value="settings.include_metadata"
      label="Include Metadata"
      description="Add timing and token info to captions"
      @update:model-value="updateIncludeMetadata"
    />
  </div>
</template>
