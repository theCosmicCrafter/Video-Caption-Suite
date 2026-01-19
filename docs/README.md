# Video Caption Suite Documentation

Welcome to the Video Caption Suite documentation. This comprehensive guide covers all aspects of the application, from installation to advanced configuration.

## What is Video Caption Suite?

Video Caption Suite is a batch video captioning application that uses the **Qwen3-VL-8B** vision-language model to automatically generate detailed text captions for video files. It provides a modern web-based interface for managing videos, configuring caption generation, and monitoring processing progress in real-time.

## Key Features

- **AI-Powered Captioning**: Uses Qwen3-VL-8B, a state-of-the-art vision-language model, to generate accurate and detailed video descriptions
- **Batch Processing**: Process multiple videos at once with progress tracking
- **Multi-GPU Support**: Distribute workload across multiple GPUs for faster processing
- **Real-Time Progress**: WebSocket-based live updates showing processing status, tokens generated, and VRAM usage
- **Customizable Prompts**: Create and save prompt templates for different captioning styles
- **Smart Frame Extraction**: Intelligent sampling strategies to capture key moments from videos
- **Performance Optimizations**: Support for SageAttention and torch.compile for faster inference
- **Modern UI**: Clean, responsive Vue 3 interface with Tailwind CSS

## Documentation Index

### Getting Started
- [Installation Guide](./installation.md) - System requirements, installation steps, and first-run setup
- [Quick Start](./quickstart.md) - Get up and running in minutes

### Core Concepts
- [Architecture Overview](./architecture.md) - System design, components, and data flow
- [Configuration Guide](./configuration.md) - All configuration options explained

### Reference
- [API Reference](./api-reference.md) - Complete REST API and WebSocket documentation
- [Frontend Guide](./frontend.md) - Vue components, stores, and UI architecture

### Development
- [Development Guide](./development.md) - Contributing, testing, and extending the application
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

## Project Structure

```
Video Caption Suite/
├── backend/                    # FastAPI server
│   ├── api.py                 # REST API endpoints & WebSocket
│   ├── processing.py          # Video processing manager
│   ├── gpu_utils.py           # GPU detection utilities
│   ├── schemas.py             # Pydantic data models
│   └── tests/                 # Unit tests
├── frontend/                   # Vue 3 + Vite UI
│   ├── src/
│   │   ├── components/        # Reusable Vue components
│   │   ├── stores/            # Pinia state management
│   │   ├── composables/       # Vue composition utilities
│   │   ├── types/             # TypeScript interfaces
│   │   └── App.vue            # Root application component
│   └── ...
├── models/                     # Downloaded model cache
├── config.py                   # Global configuration
├── model_loader.py             # Model loading with optimizations
├── video_processor.py          # Video frame extraction
├── prompt_library.json         # Saved prompts library
├── settings.json               # User settings persistence
├── requirements.txt            # Python dependencies
├── install.bat/sh              # Installation scripts
└── start.bat/sh                # Launch scripts
```

## Technology Stack

### Backend
- **Python 3.10+** - Core runtime
- **FastAPI** - High-performance async web framework
- **PyTorch** - Deep learning framework
- **Transformers** - HuggingFace model loading
- **OpenCV** - Video frame extraction
- **WebSockets** - Real-time communication

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Pinia** - State management
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation build tool

### AI Model
- **Qwen3-VL-8B** - Vision-language model from Alibaba
- Supports both image and video understanding
- ~16GB VRAM requirement per GPU

## System Requirements

### Minimum
- NVIDIA GPU with 16GB+ VRAM (RTX 3090, RTX 4090, A100, etc.)
- 32GB system RAM
- Python 3.10+
- CUDA 11.8+

### Recommended
- Multiple high-VRAM GPUs for parallel processing
- 64GB+ system RAM
- NVMe SSD for model storage
- Fast network for model download (~16GB)

## Quick Links

- [GitHub Repository](https://github.com/your-repo/video-caption-suite)
- [Report Issues](https://github.com/your-repo/video-caption-suite/issues)
- [Qwen3-VL Model Card](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)

## License

This project is provided as-is for educational and research purposes.
