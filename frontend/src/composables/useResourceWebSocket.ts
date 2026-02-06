import { ref, onUnmounted } from 'vue'
import type { ResourceSnapshot } from '@/types'
import { useResourceStore } from '@/stores/resourceStore'

export function useResourceWebSocket() {
  const resourceStore = useResourceStore()
  const ws = ref<WebSocket | null>(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 10
  const reconnectDelay = 3000

  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/ws/resources`

    try {
      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        resourceStore.setConnected(true)
        reconnectAttempts.value = 0
      }

      ws.value.onmessage = (event) => {
        try {
          const data: ResourceSnapshot = JSON.parse(event.data)
          resourceStore.update(data)
        } catch (e) {
          console.error('[ResourceWS] Failed to parse message:', e)
        }
      }

      ws.value.onclose = () => {
        resourceStore.setConnected(false)
        cleanup()
        attemptReconnect()
      }

      ws.value.onerror = () => {
        // onclose will fire after onerror
      }
    } catch (e) {
      console.error('[ResourceWS] Failed to connect:', e)
      attemptReconnect()
    }
  }

  function disconnect() {
    cleanup()
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    resourceStore.setConnected(false)
  }

  function cleanup() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
  }

  function attemptReconnect() {
    if (reconnectAttempts.value >= maxReconnectAttempts) return

    reconnectAttempts.value++
    reconnectTimeout = setTimeout(() => {
      connect()
    }, reconnectDelay * Math.min(reconnectAttempts.value, 3))
  }

  onUnmounted(() => {
    disconnect()
  })

  return { connect, disconnect }
}
