"""
Configuration for Video Caption Suite
All settings in one place for easy tuning
"""

from pathlib import Path
from typing import Optional

# =============================================================================
# PATHS
# =============================================================================

PROJECT_ROOT = Path(__file__).parent
MODELS_DIR = PROJECT_ROOT / "models"

# Create directories if they don't exist
MODELS_DIR.mkdir(exist_ok=True)

# =============================================================================
# WORKING DIRECTORY (User-configurable)
# =============================================================================

_current_working_dir: Optional[Path] = None
_traverse_subfolders: bool = False

# Default to user's home directory
_default_working_dir = Path.home()


def get_working_directory() -> Path:
    """Returns current working directory or default (user's home)"""
    return _current_working_dir or _default_working_dir


def set_working_directory(path: Path) -> None:
    """Set the working directory for videos and captions"""
    global _current_working_dir
    _current_working_dir = path


def get_working_directory_str() -> str:
    """Returns current working directory as string"""
    return str(get_working_directory())


def get_traverse_subfolders() -> bool:
    """Returns whether to traverse subfolders when finding videos"""
    return _traverse_subfolders


def set_traverse_subfolders(traverse: bool) -> None:
    """Set whether to traverse subfolders when finding videos"""
    global _traverse_subfolders
    _traverse_subfolders = traverse

# =============================================================================
# MODEL SETTINGS
# =============================================================================

# HuggingFace model ID
MODEL_ID = "Qwen/Qwen3-VL-8B-Instruct"

# Device: "cuda", "cpu", or "auto"
DEVICE = "cuda"

# Precision: "float16", "bfloat16", or "float32"
# bfloat16 is often faster on newer GPUs (A6000, RTX 40xx, etc.)
DTYPE = "bfloat16"

# =============================================================================
# INFERENCE SETTINGS
# =============================================================================

# Maximum frames to extract from each video
# More frames = better understanding but slower inference
MAX_FRAMES_PER_VIDEO = 128

# Frame size in pixels (max dimension)
# Smaller = faster but less detail
# Range: 224 - 672 (multiples of 56 work best)
FRAME_SIZE = 336

# Maximum tokens to generate per caption
MAX_TOKENS = 512

# Temperature for generation (0.0 = deterministic, higher = more creative)
# Lower values are more stable and factual
TEMPERATURE = 0.3

# Default prompt for captioning
DEFAULT_PROMPT = """Describe this video in detail. Include:
- The main subject and their actions
- The setting and environment
- Any notable objects or elements
- The overall mood or atmosphere
- Any text visible in the video"""

# =============================================================================
# OPTIMIZATION FLAGS
# =============================================================================

# Enable SageAttention (2-5x speedup if triton is installed)
# NOTE: SageAttention is NOT compatible with Qwen3-VL due to non-standard head dimensions (80)
# SageAttention only supports head dims of 64, 96, 128
USE_SAGE_ATTENTION = False

# Enable torch.compile (10-30% speedup after warmup)
# First inference will be slower due to JIT compilation
USE_TORCH_COMPILE = True

# =============================================================================
# OUTPUT SETTINGS
# =============================================================================

# File extension for output captions
OUTPUT_EXTENSION = ".txt"

# Include metadata in output (timing, token counts, etc.)
INCLUDE_METADATA = False

# =============================================================================
# VIDEO FILE EXTENSIONS
# =============================================================================

VIDEO_EXTENSIONS = {
    ".mp4", ".avi", ".mov", ".mkv", ".webm",
    ".flv", ".wmv", ".m4v", ".mpeg", ".mpg"
}
