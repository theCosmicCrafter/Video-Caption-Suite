<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
  rows?: number
  minRows?: number
  maxRows?: number
  resizable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  rows: 4,
  minRows: 3,
  maxRows: 20,
  resizable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="label">
      {{ label }}
    </label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :class="[
        'input',
        resizable ? 'resize-y' : 'resize-none',
        error && 'focus:ring-red-500',
      ]"
      :style="{
        minHeight: `${minRows * 1.5 + 1}rem`,
        maxHeight: `${maxRows * 1.5 + 1}rem`,
      }"
      @input="handleInput"
    />
    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-dark-400">{{ hint }}</p>
  </div>
</template>
