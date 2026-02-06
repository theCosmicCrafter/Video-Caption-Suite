<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  label?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showValue?: boolean
  formatValue?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showValue: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const displayValue = computed(() => {
  if (props.formatValue) {
    return props.formatValue(props.modelValue)
  }
  return props.modelValue.toString()
})

const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', parseFloat(target.value))
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="label || showValue" class="flex items-center justify-between">
      <label v-if="label" class="label mb-0">{{ label }}</label>
      <span v-if="showValue" class="text-sm font-mono text-primary-400">
        {{ displayValue }}
      </span>
    </div>
    <div class="relative">
      <input
        type="range"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        class="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer
               disabled:opacity-50 disabled:cursor-not-allowed
               [&::-webkit-slider-thumb]:appearance-none
               [&::-webkit-slider-thumb]:w-4
               [&::-webkit-slider-thumb]:h-4
               [&::-webkit-slider-thumb]:bg-primary-500
               [&::-webkit-slider-thumb]:rounded-full
               [&::-webkit-slider-thumb]:cursor-pointer
               [&::-webkit-slider-thumb]:transition-all
               [&::-webkit-slider-thumb]:hover:bg-primary-400
               [&::-webkit-slider-thumb]:hover:scale-110"
        :style="{ background: `linear-gradient(to right, rgb(92 124 250) ${percentage}%, rgb(52 58 64) ${percentage}%)` }"
        @input="handleInput"
      />
    </div>
    <div class="flex justify-between text-xs text-dark-500">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>
