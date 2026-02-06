<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import type { AnalyticsTab, VisualizationType, StopwordPreset } from '@/types/analytics'
import AnalyticsSummary from './AnalyticsSummary.vue'
import AnalyticsControls from './AnalyticsControls.vue'
import WordFrequencyChart from './WordFrequencyChart.vue'
import WordCloud from './WordCloud.vue'
import NgramView from './NgramView.vue'
import CorrelationView from './CorrelationView.vue'

const store = useAnalyticsStore()

const activeTab = ref<AnalyticsTab>('frequency')

const tabs: { key: AnalyticsTab; label: string }[] = [
  { key: 'frequency', label: 'Word Frequency' },
  { key: 'ngrams', label: 'N-grams' },
  { key: 'correlations', label: 'Correlations' }
]

// Load settings and fetch summary on mount
onMounted(async () => {
  store.loadSettings()
  await store.fetchSummary()
})

// Analyze based on active tab
async function analyze() {
  switch (activeTab.value) {
    case 'frequency':
      await store.fetchWordFrequency()
      break
    case 'ngrams':
      await store.fetchNgrams()
      break
    case 'correlations':
      await store.fetchCorrelations()
      break
  }
}

// Update settings handlers
function updateStopwordPreset(value: StopwordPreset) {
  store.updateSettings({ stopwordPreset: value })
}

function updateMinWordLength(value: number) {
  store.updateSettings({ minWordLength: value })
}

function updateTopN(value: number) {
  store.updateSettings({ topN: value })
}

function updateNgramSize(value: number) {
  store.updateSettings({ ngramSize: value })
}

function updateVisualizationType(value: VisualizationType) {
  store.updateSettings({ visualizationType: value })
}

// Clear data when switching tabs to save memory
watch(activeTab, () => {
  // Optionally clear previous tab data
})
</script>

<template>
  <div class="flex flex-col h-full bg-dark-900">
    <!-- Header -->
    <div class="px-4 py-3">
      <h2 class="text-lg font-semibold text-dark-100">Caption Analytics</h2>
      <p class="text-xs text-dark-400 mt-0.5">
        Analyze word patterns across your caption dataset
      </p>
    </div>

    <!-- Summary Stats -->
    <div class="px-4 py-3">
      <AnalyticsSummary :summary="store.summary" :loading="store.loading && !store.hasData" />
    </div>

    <!-- Tabs -->
    <div class="px-4 pt-3">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative',
            activeTab === tab.key
              ? 'bg-dark-800 text-primary-400'
              : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <!-- Active indicator -->
          <div
            v-if="activeTab === tab.key"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
          />
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="px-4 py-3">
      <AnalyticsControls
        :stopword-preset="store.settings.stopwordPreset"
        :min-word-length="store.settings.minWordLength"
        :top-n="store.settings.topN"
        :ngram-size="store.settings.ngramSize"
        :visualization-type="store.settings.visualizationType"
        :loading="store.loading"
        :active-tab="activeTab"
        @update:stopword-preset="updateStopwordPreset"
        @update:min-word-length="updateMinWordLength"
        @update:top-n="updateTopN"
        @update:ngram-size="updateNgramSize"
        @update:visualization-type="updateVisualizationType"
        @analyze="analyze"
      />
    </div>

    <!-- Error Display -->
    <div
      v-if="store.error"
      class="mx-4 mt-3 px-3 py-2 bg-red-500/10 rounded text-red-400 text-sm"
    >
      {{ store.error }}
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto px-4 py-4">
      <!-- Loading State -->
      <div
        v-if="store.loading && !store.hasData"
        class="flex items-center justify-center h-48"
      >
        <div class="flex flex-col items-center gap-3">
          <svg
            class="animate-spin h-8 w-8 text-primary-500"
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
          <span class="text-dark-400 text-sm">Analyzing captions...</span>
        </div>
      </div>

      <!-- Word Frequency Tab -->
      <div v-else-if="activeTab === 'frequency'">
        <template v-if="store.wordFrequency">
          <div class="mb-3 text-xs text-dark-500">
            Analyzed {{ store.wordFrequency.captions_analyzed.toLocaleString() }} captions
            in {{ store.wordFrequency.analysis_time_ms.toFixed(0) }}ms
          </div>

          <!-- Bar Chart View -->
          <WordFrequencyChart
            v-if="store.settings.visualizationType === 'bar'"
            :data="store.wordFrequency.words"
          />

          <!-- Word Cloud View -->
          <WordCloud
            v-else
            :words="store.wordFrequency.words"
          />
        </template>

        <div
          v-else
          class="py-12 text-center text-dark-500"
        >
          <p class="text-sm">Click "Analyze" to see word frequency distribution</p>
        </div>
      </div>

      <!-- N-grams Tab -->
      <div v-else-if="activeTab === 'ngrams'">
        <template v-if="store.ngrams">
          <div class="mb-3 text-xs text-dark-500">
            Found {{ store.ngrams.total_ngrams.toLocaleString() }}
            {{ store.ngrams.n }}-grams
            from {{ store.ngrams.captions_analyzed.toLocaleString() }} captions
          </div>

          <NgramView :ngrams="store.ngrams.ngrams" />
        </template>

        <div
          v-else
          class="py-12 text-center text-dark-500"
        >
          <p class="text-sm">Click "Analyze" to see common word combinations</p>
        </div>
      </div>

      <!-- Correlations Tab -->
      <div v-else-if="activeTab === 'correlations'">
        <template v-if="store.correlations">
          <div class="mb-3 text-xs text-dark-500">
            Found {{ store.correlations.correlations.length.toLocaleString() }} word pairs
            from {{ store.correlations.captions_analyzed.toLocaleString() }} captions
          </div>

          <CorrelationView
            :correlations="store.correlations.correlations"
            :nodes="store.correlations.nodes"
          />
        </template>

        <div
          v-else
          class="py-12 text-center text-dark-500"
        >
          <p class="text-sm">Click "Analyze" to see word correlations (PMI scores)</p>
        </div>
      </div>
    </div>

    <!-- Footer Stats -->
    <div
      v-if="store.hasData"
      class="px-4 py-2 text-xs text-dark-500 flex items-center justify-between"
    >
      <span>
        {{ store.captionsAnalyzed.toLocaleString() }} captions analyzed
      </span>
      <button
        class="text-dark-400 hover:text-dark-200 transition-colors"
        @click="store.clearData()"
      >
        Clear Results
      </button>
    </div>
  </div>
</template>
