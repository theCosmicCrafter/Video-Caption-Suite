"""
System resource monitoring using psutil and pynvml.
Provides CPU, RAM, and per-GPU metrics for real-time monitoring.
"""

import time
from typing import List, Dict, Any

try:
    import psutil
    _HAS_PSUTIL = True
except ImportError:
    _HAS_PSUTIL = False

try:
    import pynvml
    pynvml.nvmlInit()
    _HAS_PYNVML = True
except Exception:
    _HAS_PYNVML = False


class ResourceMonitor:
    """Collects system resource snapshots for CPU, RAM, and GPU metrics."""

    def __init__(self):
        self._gpu_count = 0
        self._gpu_handles = []
        if _HAS_PYNVML:
            try:
                self._gpu_count = pynvml.nvmlDeviceGetCount()
                self._gpu_handles = [
                    pynvml.nvmlDeviceGetHandleByIndex(i)
                    for i in range(self._gpu_count)
                ]
            except Exception:
                self._gpu_count = 0
                self._gpu_handles = []

    def get_snapshot(self) -> Dict[str, Any]:
        """Collect a full resource snapshot."""
        snapshot: Dict[str, Any] = {
            "cpu_percent": 0.0,
            "ram_used_gb": 0.0,
            "ram_total_gb": 0.0,
            "gpus": [],
            "timestamp": time.time(),
        }

        # CPU and RAM
        if _HAS_PSUTIL:
            snapshot["cpu_percent"] = psutil.cpu_percent(interval=None)
            mem = psutil.virtual_memory()
            snapshot["ram_used_gb"] = round(mem.used / (1024 ** 3), 2)
            snapshot["ram_total_gb"] = round(mem.total / (1024 ** 3), 2)

        # GPUs
        if _HAS_PYNVML:
            for i, handle in enumerate(self._gpu_handles):
                gpu = self._get_gpu_metrics(i, handle)
                if gpu:
                    snapshot["gpus"].append(gpu)

        return snapshot

    def _get_gpu_metrics(self, index: int, handle) -> Dict[str, Any] | None:
        """Collect metrics for a single GPU."""
        try:
            name = pynvml.nvmlDeviceGetName(handle)
            if isinstance(name, bytes):
                name = name.decode("utf-8")

            util = pynvml.nvmlDeviceGetUtilizationRates(handle)
            mem_info = pynvml.nvmlDeviceGetMemoryInfo(handle)

            try:
                temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
            except Exception:
                temp = 0

            try:
                power = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0  # mW to W
            except Exception:
                power = 0.0

            try:
                power_limit = pynvml.nvmlDeviceGetEnforcedPowerLimit(handle) / 1000.0
            except Exception:
                power_limit = 0.0

            return {
                "index": index,
                "name": name,
                "utilization_percent": util.gpu,
                "vram_used_gb": round(mem_info.used / (1024 ** 3), 2),
                "vram_total_gb": round(mem_info.total / (1024 ** 3), 2),
                "temperature_c": temp,
                "power_draw_w": round(power, 1),
                "power_limit_w": round(power_limit, 1),
            }
        except Exception:
            return None
