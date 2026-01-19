# Configuration Guide

This document explains all configuration options available in Video Caption Suite.

## Configuration Sources

Settings are loaded from multiple sources in this priority order (highest first):

1. **Runtime Updates** - Settings changed via the UI or API during a session
2. **settings.json** - Persisted user settings
3. **config.py** - Default values hardcoded in the application

## Configuration Files

### settings.json

Located in the project root, this file persists user settings between sessions.

```json
{
  "model_id": "Qwen/Qwen3-VL-8B-Instruct",
  "device": "cuda",
  "dtype": "bfloat16",
  "max_frames": 128,
  "frame_size": 336,
  "max_tokens": 512,
  "temperature": 0.3,
  "use_torch_compile": true,
  "use_sage_attention": false,
  "working_directory": "C:/Users/username/Videos",
  "prompt": "Describe this video in detail...",
  "batch_size": 1
}
```

### config.py

Contains default values and constants. Edit this file to change defaults.

```python
# Model Configuration
MODEL_ID = "Qwen/Qwen3-VL-8B-Instruct"
DEVICE = "cuda"
DTYPE = "bfloat16"

# Inference Settings
MAX_FRAMES_PER_VIDEO = 128
FRAME_SIZE = 336
MAX_TOKENS = 512
TEMPERATURE = 0.3

# Optimization Flags
USE_TORCH_COMPILE = True
USE_SAGE_ATTENTION = False

# Output Settings
OUTPUT_EXTENSION = ".txt"
```

### prompt_library.json

Stores saved prompt templates.

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Basic Description",
    "prompt": "Describe this video in detail.",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## Model Settings

### model_id

**Type**: `string`
**Default**: `"Qwen/Qwen3-VL-8B-Instruct"`

The HuggingFace model identifier to use for caption generation.

**Supported Models**:
- `Qwen/Qwen3-VL-8B-Instruct` (recommended, ~16GB VRAM)
- Other Qwen-VL variants may work but are untested

**Example**:
```json
{
  "model_id": "Qwen/Qwen3-VL-8B-Instruct"
}
```

### device

**Type**: `string`
**Default**: `"cuda"`
**Options**: `"cuda"`, `"cpu"`

The device to run inference on.

- `cuda` - Use NVIDIA GPU (recommended)
- `cpu` - Use CPU only (very slow, not recommended)

**Note**: For multi-GPU setups, the system automatically detects all available GPUs. This setting specifies the primary device type.

### dtype

**Type**: `string`
**Default**: `"bfloat16"`
**Options**: `"float16"`, `"bfloat16"`, `"float32"`

The data type for model weights and computations.

| Type     | VRAM Usage | Speed    | Precision | Notes                          |
|----------|------------|----------|-----------|--------------------------------|
| float16  | Low        | Fast     | Good      | May have numerical issues      |
| bfloat16 | Low        | Fast     | Good      | Recommended for Ampere+ GPUs   |
| float32  | High       | Slower   | Best      | Use if precision issues occur  |

**Recommendation**: Use `bfloat16` on RTX 30xx/40xx or newer GPUs.

---

## Inference Settings

### max_frames

**Type**: `integer`
**Default**: `128`
**Range**: `1` - `256`

Maximum number of frames to extract from each video for analysis.

**Trade-offs**:
- **Higher values** (128-256): Better understanding of video content, more VRAM, slower processing
- **Lower values** (16-64): Faster processing, less VRAM, may miss details

**Recommendations**:
- Short clips (<30s): 32-64 frames
- Medium videos (30s-5min): 64-128 frames
- Long videos (>5min): 128-256 frames

### frame_size

**Type**: `integer`
**Default**: `336`
**Range**: `224` - `672`

Maximum dimension (width or height) for extracted frames. Frames are resized while preserving aspect ratio.

**Trade-offs**:
- **Higher values** (448-672): Better detail recognition, more VRAM
- **Lower values** (224-336): Faster processing, less VRAM

**Recommendations**:
- HD content: 336 (default)
- 4K content: 448-512
- Low-resolution content: 224-280

### max_tokens

**Type**: `integer`
**Default**: `512`
**Range**: `64` - `2048`

Maximum number of tokens to generate in the caption.

**Guidelines**:
- **Short descriptions** (1-2 sentences): 64-128 tokens
- **Detailed descriptions**: 256-512 tokens
- **Comprehensive analysis**: 512-1024 tokens

**Note**: Longer outputs take more time to generate.

### temperature

**Type**: `float`
**Default**: `0.3`
**Range**: `0.0` - `1.0`

Controls randomness in text generation.

| Value | Behavior                                              |
|-------|-------------------------------------------------------|
| 0.0   | Deterministic, always same output for same input      |
| 0.3   | Slightly varied, mostly consistent (recommended)      |
| 0.7   | More creative, varied descriptions                    |
| 1.0   | Highly random, may be inconsistent                    |

**Recommendations**:
- Technical descriptions: 0.0-0.3
- Creative descriptions: 0.5-0.7
- Brainstorming: 0.7-1.0

---

## Optimization Settings

### use_torch_compile

**Type**: `boolean`
**Default**: `true`

Enable PyTorch 2.0 JIT compilation for optimized inference.

**Benefits**:
- 10-30% faster inference after warmup
- No additional VRAM usage

**Drawbacks**:
- First inference takes longer (compilation phase)
- May cause issues on some systems

**Recommendation**: Keep enabled unless experiencing errors.

### use_sage_attention

**Type**: `boolean`
**Default**: `false`

Enable SageAttention optimization for attention computation.

**Benefits**:
- 2-5x faster attention computation
- Reduced memory bandwidth usage

**Drawbacks**:
- Not compatible with Qwen3-VL-8B (head_dim=80 not supported)
- Requires SageAttention package installed

**Note**: Currently disabled by default because Qwen3-VL-8B uses head_dim=80, which is not supported by SageAttention (requires 64, 96, or 128). The application will gracefully fall back to standard attention if enabled.

### batch_size

**Type**: `integer`
**Default**: `1`
**Range**: `1` - `8`

Number of GPUs to use for parallel processing.

| Value | Behavior                                           |
|-------|----------------------------------------------------|
| 1     | Single GPU, sequential processing                  |
| 2+    | Multi-GPU, parallel processing                     |

**Requirements**:
- Each GPU needs ~16GB VRAM
- Value capped at available GPU count

**Performance**:
- 1 GPU: ~2-4 videos/minute
- 2 GPUs: ~4-8 videos/minute
- 4 GPUs: ~8-16 videos/minute

---

## Directory Settings

### working_directory

**Type**: `string`
**Default**: User's home directory

The directory containing videos to process. Captions are saved alongside videos.

**Requirements**:
- Must be an existing directory
- User must have read/write access
- Cannot contain `..` (path traversal)

**Example**:
```json
{
  "working_directory": "C:/Users/username/Videos/ToCaption"
}
```

---

## Prompt Settings

### prompt

**Type**: `string`
**Default**: Basic description prompt

The prompt sent to the model for caption generation.

**Default Prompt**:
```
Describe this video in detail. Include information about:
- The main subjects and their actions
- The setting and environment
- Any notable objects or elements
- The overall mood or atmosphere
```

**Prompt Tips**:

1. **Be specific** about what you want described
2. **Use bullet points** for structured output
3. **Mention context** if relevant (e.g., "This is a training video")
4. **Request format** if needed (e.g., "Output as JSON")

**Example Prompts**:

```
# Action-focused
Describe the actions and movements in this video chronologically.

# Object detection
List all visible objects in this video with their approximate locations.

# Scene analysis
Analyze this video scene by scene. For each scene, describe:
- Visual content
- Estimated duration
- Key transitions

# Training data
Write a detailed caption for this video suitable for training an AI model.
Focus on visual elements only, no speculation about off-screen content.
```

---

## Environment Variables

The following environment variables can override configuration:

```bash
# Override model cache directory
export HF_HOME=/path/to/model/cache

# CUDA device selection
export CUDA_VISIBLE_DEVICES=0,1

# Disable CUDA (force CPU)
export CUDA_VISIBLE_DEVICES=""
```

---

## Configuration Validation

The application validates all settings on load and update:

| Setting            | Validation                              |
|--------------------|-----------------------------------------|
| model_id           | Must be non-empty string                |
| device             | Must be "cuda" or "cpu"                 |
| dtype              | Must be "float16", "bfloat16", "float32"|
| max_frames         | 1-256, integer                          |
| frame_size         | 224-672, integer                        |
| max_tokens         | 64-2048, integer                        |
| temperature        | 0.0-1.0, float                          |
| batch_size         | 1-8, integer, capped at GPU count       |
| working_directory  | Must exist, no path traversal           |

---

## Recommended Configurations

### High Quality (Slow)

For best quality captions with detailed analysis:

```json
{
  "max_frames": 256,
  "frame_size": 448,
  "max_tokens": 1024,
  "temperature": 0.3,
  "use_torch_compile": true
}
```

### Balanced (Default)

Good balance of quality and speed:

```json
{
  "max_frames": 128,
  "frame_size": 336,
  "max_tokens": 512,
  "temperature": 0.3,
  "use_torch_compile": true
}
```

### Fast Processing

For quick batch processing of many videos:

```json
{
  "max_frames": 64,
  "frame_size": 280,
  "max_tokens": 256,
  "temperature": 0.0,
  "use_torch_compile": true,
  "batch_size": 2
}
```

### Low VRAM (~12GB)

For GPUs with limited memory:

```json
{
  "max_frames": 32,
  "frame_size": 224,
  "max_tokens": 256,
  "dtype": "float16",
  "use_torch_compile": false
}
```

---

## Troubleshooting Configuration

### Settings Not Persisting

1. Check write permissions on project directory
2. Verify `settings.json` is not read-only
3. Check for JSON syntax errors in settings file

### GPU Not Detected

1. Verify CUDA installation: `nvidia-smi`
2. Check PyTorch CUDA: `python -c "import torch; print(torch.cuda.is_available())"`
3. Set `device: "cpu"` as fallback

### Out of Memory Errors

1. Reduce `max_frames` (try 64 or 32)
2. Reduce `frame_size` (try 280 or 224)
3. Set `dtype: "float16"`
4. Disable `use_torch_compile`
5. Close other GPU applications
