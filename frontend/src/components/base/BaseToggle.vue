<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  description?: string
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="flex items-start gap-3">
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      :class="[
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        modelValue ? 'bg-primary-600' : 'bg-dark-600',
      ]"
      @click="toggle"
    >
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full',
          'bg-white shadow ring-0 transition duration-200 ease-in-out',
          modelValue ? 'translate-x-5' : 'translate-x-0',
        ]"
      />
    </button>
    <div v-if="label || description" class="flex flex-col">
      <span v-if="label" class="text-sm font-medium text-dark-200">{{ label }}</span>
      <span v-if="description" class="text-sm text-dark-400">{{ description }}</span>
    </div>
  </div>
</template>
