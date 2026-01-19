"""
GPU detection and management utilities for multi-GPU processing
"""

import torch
from typing import List, Dict, Any


def get_gpu_count() -> int:
    """Returns number of available CUDA devices, 0 if no CUDA"""
    if not torch.cuda.is_available():
        return 0
    return torch.cuda.device_count()


def get_gpu_info() -> List[Dict[str, Any]]:
    """Get detailed info for all available GPUs"""
    gpus = []
    count = get_gpu_count()

    for i in range(count):
        props = torch.cuda.get_device_properties(i)
        memory_total = props.total_memory / (1024 ** 3)
        memory_allocated = torch.cuda.memory_allocated(i) / (1024 ** 3)
        memory_free = memory_total - memory_allocated

        gpus.append({
            "index": i,
            "name": props.name,
            "memory_total_gb": round(memory_total, 2),
            "memory_free_gb": round(memory_free, 2),
            "device": f"cuda:{i}",
        })

    return gpus


def get_system_info() -> Dict[str, Any]:
    """Get system GPU information for API response"""
    gpus = get_gpu_info()
    gpu_count = len(gpus)
    return {
        "gpu_count": gpu_count,
        "gpus": gpus,
        "cuda_available": torch.cuda.is_available(),
        "cuda_version": torch.version.cuda if torch.cuda.is_available() else None,
        "max_batch_size": min(gpu_count, 8) if gpu_count > 0 else 1,
    }
