<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  type?: 'text' | 'number' | 'email' | 'password'
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? parseFloat(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="label">
      {{ label }}
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="step"
      :class="[
        'input',
        error && 'focus:ring-red-500',
      ]"
      @input="handleInput"
    />
    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-dark-400">{{ hint }}</p>
  </div>
</template>
