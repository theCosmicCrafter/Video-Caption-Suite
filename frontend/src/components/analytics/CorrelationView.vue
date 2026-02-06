<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CorrelationItem } from '@/types/analytics'

interface Props {
  correlations: CorrelationItem[]
  nodes: string[]
}

const props = defineProps<Props>()

type ViewType = 'list' | 'network'
const viewType = ref<ViewType>('list')

// For list view: sort by PMI score
const sortedCorrelations = computed(() =>
  [...props.correlations].sort((a, b) => b.pmi_score - a.pmi_score).slice(0, 50)
)

// For network view: prepare SVG data
const networkData = computed(() => {
  if (props.nodes.length === 0) return { nodes: [], links: [] }

  // Position nodes in a circle
  const centerX = 180
  const centerY = 180
  const radius = 140

  const limitedNodes = props.nodes.slice(0, 20)
  const nodePositions = limitedNodes.map((word, i, arr) => {
    const angle = (2 * Math.PI * i) / arr.length - Math.PI / 2
    return {
      word,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  })

  // Filter correlations to only include visible nodes
  const visibleWords = new Set(nodePositions.map(n => n.word))
  const links = props.correlations
    .filter(c => visibleWords.has(c.word1) && visibleWords.has(c.word2))
    .slice(0, 100)
    .map(c => {
      const source = nodePositions.find(n => n.word === c.word1)!
      const target = nodePositions.find(n => n.word === c.word2)!
      return { ...c, source, target }
    })

  return { nodes: nodePositions, links }
})

// PMI score to opacity and thickness
const maxPmi = computed(() => {
  if (props.correlations.length === 0) return 1
  return Math.max(...props.correlations.map(c => c.pmi_score))
})

function pmiToOpacity(pmi: number): number {
  return 0.15 + (pmi / maxPmi.value) * 0.7
}

function pmiToWidth(pmi: number): number {
  return 0.5 + (pmi / maxPmi.value) * 2
}

// PMI color scale (negative = red, positive = green/blue)
function pmiToColor(pmi: number): string {
  if (pmi < 0) {
    return `rgba(239, 68, 68, ${pmiToOpacity(Math.abs(pmi))})`
  }
  return `rgba(139, 92, 246, ${pmiToOpacity(pmi)})`
}
</script>

<template>
  <div>
    <!-- View toggle -->
    <div class="flex gap-2 mb-4">
      <button
        v-for="type in [
          { key: 'list', label: 'List View' },
          { key: 'network', label: 'Network' }
        ]"
        :key="type.key"
        :class="[
          'px-3 py-1.5 text-xs rounded-lg transition-colors',
          viewType === type.key
            ? 'bg-primary-500/20 text-primary-400'
            : 'bg-dark-700 text-dark-400 hover:text-dark-200'
        ]"
        @click="viewType = type.key as ViewType"
      >
        {{ type.label }}
      </button>
    </div>

    <!-- List view -->
    <div v-if="viewType === 'list'" class="space-y-0.5 max-h-[400px] overflow-y-auto">
      <div
        v-for="corr in sortedCorrelations"
        :key="`${corr.word1}-${corr.word2}`"
        class="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-dark-700/50 text-sm"
      >
        <span class="text-primary-400 font-medium">{{ corr.word1 }}</span>
        <span class="text-dark-600">+</span>
        <span class="text-primary-400 font-medium">{{ corr.word2 }}</span>
        <span class="flex-1" />
        <span class="text-xs text-dark-400 font-mono">{{ corr.co_occurrence }}x</span>
        <span
          :class="[
            'text-xs w-16 text-right font-mono',
            corr.pmi_score >= 0 ? 'text-green-400' : 'text-red-400'
          ]"
        >
          {{ corr.pmi_score >= 0 ? '+' : '' }}{{ corr.pmi_score.toFixed(2) }}
        </span>
      </div>

      <!-- Empty state -->
      <div
        v-if="sortedCorrelations.length === 0"
        class="py-8 text-center text-dark-500 text-sm"
      >
        No correlations found
      </div>
    </div>

    <!-- Network view (SVG) -->
    <div v-else class="flex justify-center">
      <svg
        width="360"
        height="360"
        class="bg-dark-800/30 rounded-lg"
        viewBox="0 0 360 360"
      >
        <!-- Links -->
        <line
          v-for="link in networkData.links"
          :key="`${link.word1}-${link.word2}`"
          :x1="link.source.x"
          :y1="link.source.y"
          :x2="link.target.x"
          :y2="link.target.y"
          :stroke="pmiToColor(link.pmi_score)"
          :stroke-width="pmiToWidth(link.pmi_score)"
        />

        <!-- Nodes -->
        <g v-for="node in networkData.nodes" :key="node.word">
          <circle
            :cx="node.x"
            :cy="node.y"
            r="4"
            class="fill-primary-400"
          />
          <text
            :x="node.x"
            :y="node.y - 8"
            class="text-[10px] fill-dark-200"
            text-anchor="middle"
            font-family="system-ui, sans-serif"
          >
            {{ node.word }}
          </text>
        </g>

        <!-- Empty state -->
        <text
          v-if="networkData.nodes.length === 0"
          x="180"
          y="180"
          class="text-sm fill-dark-500"
          text-anchor="middle"
        >
          No network data
        </text>
      </svg>
    </div>

    <!-- Legend -->
    <div v-if="viewType === 'network' && networkData.links.length > 0" class="mt-3 text-xs text-dark-500 text-center">
      Line thickness indicates correlation strength (PMI score)
    </div>
  </div>
</template>
