<script setup lang="ts">
interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string
  options: Option[]
  label?: string
  disabled?: boolean
  error?: string
  hint?: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="label">
      {{ label }}
    </label>
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="[
        'input appearance-none cursor-pointer',
        error && 'focus:ring-red-500',
      ]"
      @change="handleChange"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-dark-400">{{ hint }}</p>
  </div>
</template>
