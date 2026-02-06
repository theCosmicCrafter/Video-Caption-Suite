<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useProgressStore } from '@/stores/progressStore'

const progressStore = useProgressStore()
const { wsConnected, state } = storeToRefs(progressStore)
</script>

<template>
  <header class="bg-dark-800">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-dark-100">Video Caption Suite</h1>
            <p class="text-xs text-dark-400">Qwen3-VL-8B</p>
          </div>
        </div>

        <!-- Status indicators -->
        <div class="flex items-center gap-4">
          <!-- VRAM -->
          <div v-if="state.vram_used_gb > 0" class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span class="font-mono text-dark-300">{{ state.vram_used_gb.toFixed(1) }} GB</span>
          </div>

          <!-- Model status -->
          <div class="flex items-center gap-2 text-sm">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                state.model_loaded ? 'bg-green-500' : 'bg-dark-500',
              ]"
            />
            <span class="text-dark-400">
              {{ state.model_loaded ? 'Model Loaded' : 'Model Not Loaded' }}
            </span>
          </div>

          <!-- Connection status -->
          <div class="flex items-center gap-2 text-sm">
            <div
              :class="[
                'w-2 h-2 rounded-full',
                wsConnected ? 'bg-green-500' : 'bg-red-500',
              ]"
            />
            <span class="text-dark-400">
              {{ wsConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
