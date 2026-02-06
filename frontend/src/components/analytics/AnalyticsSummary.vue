<script setup lang="ts">
import type { AnalyticsSummary } from '@/types/analytics'

interface Props {
  summary: AnalyticsSummary | null
  loading?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <!-- Total Captions -->
    <div class="bg-dark-800/50 rounded-lg p-3">
      <div class="text-xs text-dark-400 mb-1">Captions</div>
      <div v-if="loading" class="h-6 bg-dark-700 animate-pulse rounded" />
      <div v-else class="text-lg font-semibold text-dark-100">
        {{ summary?.total_captions.toLocaleString() ?? '—' }}
      </div>
    </div>

    <!-- Total Words -->
    <div class="bg-dark-800/50 rounded-lg p-3">
      <div class="text-xs text-dark-400 mb-1">Total Words</div>
      <div v-if="loading" class="h-6 bg-dark-700 animate-pulse rounded" />
      <div v-else class="text-lg font-semibold text-dark-100">
        {{ summary?.total_words.toLocaleString() ?? '—' }}
      </div>
    </div>

    <!-- Unique Words -->
    <div class="bg-dark-800/50 rounded-lg p-3">
      <div class="text-xs text-dark-400 mb-1">Unique Words</div>
      <div v-if="loading" class="h-6 bg-dark-700 animate-pulse rounded" />
      <div v-else class="text-lg font-semibold text-dark-100">
        {{ summary?.unique_words.toLocaleString() ?? '—' }}
      </div>
    </div>

    <!-- Avg Words per Caption -->
    <div class="bg-dark-800/50 rounded-lg p-3">
      <div class="text-xs text-dark-400 mb-1">Avg per Caption</div>
      <div v-if="loading" class="h-6 bg-dark-700 animate-pulse rounded" />
      <div v-else class="text-lg font-semibold text-dark-100">
        {{ summary?.avg_words_per_caption.toFixed(1) ?? '—' }}
      </div>
    </div>
  </div>

  <!-- Top Words Preview -->
  <div v-if="summary?.top_words && summary.top_words.length > 0" class="mt-4">
    <div class="text-xs text-dark-400 mb-2">Top Words</div>
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="item in summary.top_words.slice(0, 10)"
        :key="item.word"
        class="px-2 py-0.5 bg-primary-500/10 text-primary-400 text-xs rounded-full"
      >
        {{ item.word }}
        <span class="text-dark-500 ml-1">{{ item.count }}</span>
      </span>
    </div>
  </div>
</template>
