<script setup lang="ts">
import { useResizable } from '@/composables/useResizable'

interface Props {
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
  side: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  initialWidth: 384,
  minWidth: 280,
  maxWidth: 600,
})

const { width, isResizing, startResize } = useResizable({
  initialWidth: props.initialWidth,
  minWidth: props.minWidth,
  maxWidth: props.maxWidth,
  direction: props.side,
})

defineExpose({ width })
</script>

<template>
  <aside
    class="flex-shrink-0 relative flex flex-col"
    :class="[
      '',
    ]"
    :style="{ width: `${width}px` }"
  >
    <slot />

    <!-- Resize handle -->
    <div
      class="absolute top-0 h-full w-2 cursor-ew-resize group"
      :class="[
        side === 'left' ? 'right-0' : 'left-0',
        isResizing ? 'bg-primary-500/30' : 'hover:bg-primary-500/20',
      ]"
      @mousedown="startResize"
    >
      <!-- Visible grip dots -->
      <div
        class="absolute top-1/2 transform -translate-y-1/2 flex flex-col gap-1 py-2 px-0.5 rounded transition-colors"
        :class="[
          side === 'left' ? 'right-0 -translate-x-0.5' : 'left-0 translate-x-0.5',
          isResizing ? 'bg-primary-500/40' : 'bg-dark-700 group-hover:bg-dark-600',
        ]"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="w-1 h-1 rounded-full"
          :class="isResizing ? 'bg-primary-400' : 'bg-dark-500 group-hover:bg-dark-400'"
        />
      </div>
    </div>
  </aside>
</template>
