export interface GPUMetrics {
  index: number
  name: string
  utilization_percent: number
  vram_used_gb: number
  vram_total_gb: number
  temperature_c: number
  power_draw_w: number
  power_limit_w: number
}

export interface ResourceSnapshot {
  cpu_percent: number
  ram_used_gb: number
  ram_total_gb: number
  gpus: GPUMetrics[]
  timestamp: number
}

export const initialResourceSnapshot: ResourceSnapshot = {
  cpu_percent: 0,
  ram_used_gb: 0,
  ram_total_gb: 0,
  gpus: [],
  timestamp: 0,
}
