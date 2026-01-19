# Installation Guide

This guide covers system requirements, installation steps, and first-run setup for Video Caption Suite.

## System Requirements

### Minimum Requirements

| Component     | Requirement                                    |
|---------------|------------------------------------------------|
| GPU           | NVIDIA GPU with 16GB+ VRAM                     |
| System RAM    | 32GB                                           |
| Storage       | 50GB free (20GB for model, 30GB for cache)     |
| Python        | 3.10 or higher                                 |
| CUDA          | 11.8 or higher                                 |
| OS            | Windows 10/11, Linux (Ubuntu 20.04+), macOS    |

### Recommended Requirements

| Component     | Recommendation                                 |
|---------------|------------------------------------------------|
| GPU           | RTX 4090, A100, or multiple RTX 3090s          |
| System RAM    | 64GB+                                          |
| Storage       | NVMe SSD with 100GB+ free                      |
| Python        | 3.11                                           |
| CUDA          | 12.1+                                          |

### Supported GPUs

**Tested and Recommended**:
- NVIDIA RTX 4090 (24GB)
- NVIDIA RTX 3090 (24GB)
- NVIDIA A100 (40GB/80GB)
- NVIDIA A6000 (48GB)

**Should Work** (16GB+ VRAM):
- NVIDIA RTX 4080 (16GB)
- NVIDIA RTX 3080 Ti (12GB) - may need reduced settings
- NVIDIA V100 (16GB/32GB)
- NVIDIA L40 (48GB)

**Not Recommended** (<16GB VRAM):
- RTX 3080 (10GB) - likely OOM errors
- RTX 3070/3060 - insufficient VRAM
- GTX series - too old/slow

---

## Pre-Installation

### 1. Verify NVIDIA Driver

Check that NVIDIA drivers are installed:

```bash
nvidia-smi
```

Expected output shows driver version and GPU info:
```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.104.05   Driver Version: 535.104.05   CUDA Version: 12.2     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA GeForce ...  Off  | 00000000:01:00.0  On |                  N/A |
|  0%   40C    P8    20W / 450W |   1234MiB / 24576MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
```

### 2. Verify CUDA Installation

Check CUDA toolkit:

```bash
nvcc --version
```

If not installed, download from [NVIDIA CUDA Toolkit](https://developer.nvidia.com/cuda-downloads).

### 3. Install Python (if needed)

**Windows**:
Download from [python.org](https://www.python.org/downloads/) or use:
```powershell
winget install Python.Python.3.11
```

**Linux**:
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

**macOS**:
```bash
brew install python@3.11
```

Verify installation:
```bash
python --version  # or python3 --version
```

---

## Installation Methods

### Method 1: Automated Installation (Recommended)

#### Windows

1. **Download or clone the repository**:
   ```powershell
   git clone https://github.com/your-repo/video-caption-suite.git
   cd video-caption-suite
   ```

2. **Run the installer**:
   ```powershell
   .\install.bat
   ```

   This script will:
   - Create a Python virtual environment
   - Install all Python dependencies
   - Build the frontend (if Node.js is available)
   - Download required model files on first run

3. **Start the application**:
   ```powershell
   .\start.bat
   ```

4. **Open in browser**:
   Navigate to `http://localhost:8000`

#### Linux / macOS

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/video-caption-suite.git
   cd video-caption-suite
   ```

2. **Make scripts executable**:
   ```bash
   chmod +x install.sh start.sh
   ```

3. **Run the installer**:
   ```bash
   ./install.sh
   ```

4. **Start the application**:
   ```bash
   ./start.sh
   ```

### Method 2: Manual Installation

#### Step 1: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Linux/macOS)
source venv/bin/activate
```

#### Step 2: Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 3: Install PyTorch with CUDA

If PyTorch wasn't installed with CUDA support, reinstall:

```bash
# For CUDA 11.8
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# For CUDA 12.1
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

Verify CUDA support:
```python
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
```

#### Step 4: Build Frontend (Optional)

If you want to modify the frontend:

```bash
cd frontend
npm install
npm run build
cd ..
```

The built files are served from `frontend/dist/`.

#### Step 5: Start the Server

```bash
python -m uvicorn backend.api:app --host 0.0.0.0 --port 8000
```

---

## First Run Setup

### Model Download

On first processing, the application downloads the Qwen3-VL-8B model (~16GB):

1. Start processing any video
2. The model download begins automatically
3. Progress is shown in the console
4. Download typically takes 5-15 minutes depending on connection

**Model Storage Location**:
```
./models/Qwen3-VL-8B-Instruct/
```

You can also manually download:
```bash
python -c "from huggingface_hub import snapshot_download; snapshot_download('Qwen/Qwen3-VL-8B-Instruct', local_dir='./models/Qwen3-VL-8B-Instruct')"
```

### Initial Configuration

1. **Set Working Directory**: Click "Browse" in the settings panel to select your video folder

2. **Configure Inference Settings** (optional):
   - Adjust max frames based on your videos
   - Set temperature for caption style
   - Enable/disable optimizations

3. **Test Processing**:
   - Select a single video
   - Click "Process"
   - Monitor progress in the status panel

---

## Troubleshooting Installation

### Python Not Found

**Windows**:
Add Python to PATH during installation, or:
```powershell
$env:PATH += ";C:\Users\YourName\AppData\Local\Programs\Python\Python311"
```

**Linux**:
```bash
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1
```

### pip Install Fails

Try upgrading pip first:
```bash
python -m pip install --upgrade pip setuptools wheel
```

For SSL errors:
```bash
pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt
```

### CUDA Not Detected

1. Verify driver: `nvidia-smi`
2. Check PyTorch:
   ```python
   import torch
   print(torch.cuda.is_available())
   print(torch.version.cuda)
   ```
3. Reinstall PyTorch with correct CUDA version

### Out of Memory During Model Load

1. Close other GPU applications
2. Reduce `max_frames` in settings
3. Try `dtype: "float16"` instead of `bfloat16`
4. Free up system RAM

### Module Not Found Errors

Ensure virtual environment is activated:
```bash
# Windows
.\venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

Then reinstall:
```bash
pip install -r requirements.txt
```

### Port Already in Use

Change the port:
```bash
python -m uvicorn backend.api:app --port 8001
```

Or find and kill the process using port 8000:
```bash
# Linux/macOS
lsof -i :8000
kill -9 <PID>

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

## Upgrading

### From Git

```bash
git pull origin main
pip install -r requirements.txt
cd frontend && npm install && npm run build && cd ..
```

### Manual Upgrade

1. Download the latest release
2. Back up your `settings.json` and `prompt_library.json`
3. Replace all files
4. Restore your backed-up files
5. Run `pip install -r requirements.txt`

---

## Uninstallation

### Remove Application

```bash
# Deactivate virtual environment
deactivate

# Remove directory
rm -rf video-caption-suite
```

### Remove Model Cache

Models are stored in:
- `./models/` (application directory)
- `~/.cache/huggingface/` (HuggingFace cache)

```bash
rm -rf ./models
rm -rf ~/.cache/huggingface/hub/models--Qwen--Qwen3-VL-8B-Instruct
```

---

## Docker Installation (Alternative)

A Dockerfile is planned for future releases. For now, use the native installation.

---

## Next Steps

After installation:

1. Read the [Quick Start Guide](./quickstart.md)
2. Configure settings in [Configuration Guide](./configuration.md)
3. Learn about features in [Architecture Overview](./architecture.md)
