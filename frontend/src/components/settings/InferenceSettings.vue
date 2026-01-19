<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'
import { BaseSlider, BaseToggle } from '@/components/base'

const settingsStore = useSettingsStore()

const { settings, hasMultiGPU, maxBatchSize, gpuInfo } = storeToRefs(settingsStore)

function updateMaxFrames(value: number) {
  settingsStore.setLocalSetting('max_frames', value)
}

function updateFrameSize(value: number) {
  settingsStore.setLocalSetting('frame_size', value)
}

function updateMaxTokens(value: number) {
  settingsStore.setLocalSetting('max_tokens', value)
}

function updateTemperature(value: number) {
  settingsStore.setLocalSetting('temperature', value)
}

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
  <div class="space-y-6">
    <BaseSlider
      :model-value="settings.max_frames"
      label="Max Frames"
      :min="1"
      :max="128"
      :step="1"
      @update:model-value="updateMaxFrames"
    />

    <BaseSlider
      :model-value="settings.frame_size"
      label="Frame Size"
      :min="224"
      :max="672"
      :step="56"
      :format-value="(v: number) => `${v}px`"
      @update:model-value="updateFrameSize"
    />

    <BaseSlider
      :model-value="settings.max_tokens"
      label="Max Tokens"
      :min="64"
      :max="2048"
      :step="64"
      @update:model-value="updateMaxTokens"
    />

    <BaseSlider
      :model-value="settings.temperature"
      label="Temperature"
      :min="0"
      :max="2"
      :step="0.1"
      :format-value="(v: number) => v.toFixed(1)"
      @update:model-value="updateTemperature"
    />

    <!-- Optimization Settings -->
    <div class="border-t border-dark-700 pt-4 space-y-4">
      <h4 class="text-xs font-medium text-dark-400 uppercase tracking-wider">Optimization</h4>

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
  </div>
</template>
