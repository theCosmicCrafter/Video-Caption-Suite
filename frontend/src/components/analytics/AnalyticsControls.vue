<script setup lang="ts">
import { computed } from 'vue'
import type { StopwordPreset, VisualizationType } from '@/types/analytics'

interface Props {
  stopwordPreset: StopwordPreset
  minWordLength: number
  topN: number
  ngramSize: number
  visualizationType: VisualizationType
  loading?: boolean
  activeTab: 'frequency' | 'ngrams' | 'correlations'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:stopwordPreset': [value: StopwordPreset]
  'update:minWordLength': [value: number]
  'update:topN': [value: number]
  'update:ngramSize': [value: number]
  'update:visualizationType': [value: VisualizationType]
  analyze: []
}>()

const stopwordOptions: { value: StopwordPreset; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'english', label: 'English' }
]

const vizOptions: { value: VisualizationType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'wordcloud', label: 'Word Cloud' }
]

const ngramOptions = [
  { value: 2, label: 'Bigrams (2)' },
  { value: 3, label: 'Trigrams (3)' },
  { value: 4, label: '4-grams' }
]

const showVizToggle = computed(() => props.activeTab === 'frequency')
const showNgramSize = computed(() => props.activeTab === 'ngrams')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 p-3 bg-dark-800/30 rounded-lg">
    <!-- Stopword Preset -->
    <div class="flex items-center gap-2">
      <label class="text-xs text-dark-400">Stopwords:</label>
      <select
        :value="stopwordPreset"
        :disabled="loading"
        class="bg-dark-700 text-dark-200 text-xs rounded px-2 py-1 focus:outline-none disabled:opacity-50"
        @change="emit('update:stopwordPreset', ($event.target as HTMLSelectElement).value as StopwordPreset)"
      >
        <option v-for="opt in stopwordOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Min Word Length -->
    <div class="flex items-center gap-2">
      <label class="text-xs text-dark-400">Min Length:</label>
      <input
        type="number"
        :value="minWordLength"
        :disabled="loading"
        min="1"
        max="10"
        class="bg-dark-700 text-dark-200 text-xs rounded px-2 py-1 w-14 focus:outline-none disabled:opacity-50"
        @input="emit('update:minWordLength', parseInt(($event.target as HTMLInputElement).value) || 2)"
      />
    </div>

    <!-- Top N -->
    <div class="flex items-center gap-2">
      <label class="text-xs text-dark-400">Top N:</label>
      <input
        type="number"
        :value="topN"
        :disabled="loading"
        min="10"
        max="200"
        step="10"
        class="bg-dark-700 text-dark-200 text-xs rounded px-2 py-1 w-16 focus:outline-none disabled:opacity-50"
        @input="emit('update:topN', parseInt(($event.target as HTMLInputElement).value) || 50)"
      />
    </div>

    <!-- N-gram Size (only for ngrams tab) -->
    <div v-if="showNgramSize" class="flex items-center gap-2">
      <label class="text-xs text-dark-400">N-gram:</label>
      <select
        :value="ngramSize"
        :disabled="loading"
        class="bg-dark-700 text-dark-200 text-xs rounded px-2 py-1 focus:outline-none disabled:opacity-50"
        @change="emit('update:ngramSize', parseInt(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="opt in ngramOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Visualization Type (only for frequency tab) -->
    <div v-if="showVizToggle" class="flex items-center gap-1 ml-auto">
      <button
        v-for="opt in vizOptions"
        :key="opt.value"
        :disabled="loading"
        :class="[
          'px-2 py-1 text-xs rounded transition-colors',
          visualizationType === opt.value
            ? 'bg-primary-500/20 text-primary-400'
            : 'bg-dark-700 text-dark-400 hover:text-dark-200'
        ]"
        @click="emit('update:visualizationType', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Analyze Button -->
    <button
      :disabled="loading"
      class="ml-auto px-4 py-1.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white text-xs font-medium rounded transition-colors flex items-center gap-2"
      @click="emit('analyze')"
    >
      <svg
        v-if="loading"
        class="animate-spin h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {{ loading ? 'Analyzing...' : 'Analyze' }}
    </button>
  </div>
</template>
