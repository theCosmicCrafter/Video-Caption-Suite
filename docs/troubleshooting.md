# Troubleshooting Guide

This guide covers common issues and their solutions when using Video Caption Suite.

## Quick Diagnosis

### Check System Status

1. **Verify GPU is detected**:
   ```bash
   nvidia-smi
   ```

2. **Check Python CUDA support**:
   ```bash
   python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}, Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"None\"}')"
   ```

3. **Check API health**:
   ```bash
   curl http://localhost:8000/api/health
   ```

4. **Check WebSocket connection** (in browser console):
   ```javascript
   new WebSocket('ws://localhost:8000/ws/progress').onopen = () => console.log('WS OK')
   ```

---

## Installation Issues

### Python Not Found

**Symptom**: `python: command not found` or `'python' is not recognized`

**Solutions**:

1. **Windows**: Add Python to PATH
   - Re-run Python installer
   - Check "Add Python to PATH"
   - Or manually add: `C:\Users\<name>\AppData\Local\Programs\Python\Python311`

2. **Linux**: Create symlink
   ```bash
   sudo ln -s /usr/bin/python3 /usr/bin/python
   ```

3. **macOS**: Use python3 explicitly
   ```bash
   python3 -m venv venv
   ```

### pip Install Fails

**Symptom**: SSL errors, timeout, or dependency conflicts

**Solutions**:

1. **SSL Errors**:
   ```bash
   pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt
   ```

2. **Timeout**:
   ```bash
   pip install --timeout 120 -r requirements.txt
   ```

3. **Dependency Conflicts**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt --force-reinstall
   ```

### CUDA Not Available

**Symptom**: `torch.cuda.is_available()` returns `False`

**Solutions**:

1. **Check NVIDIA driver**:
   ```bash
   nvidia-smi
   ```
   If not found, install NVIDIA drivers.

2. **Reinstall PyTorch with CUDA**:
   ```bash
   pip uninstall torch torchvision
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
   ```

3. **Check CUDA version compatibility**:
   - CUDA 11.8: Use `cu118` index
   - CUDA 12.1: Use `cu121` index

### Node.js/npm Issues

**Symptom**: Frontend build fails

**Solutions**:

1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use specific Node version**:
   ```bash
   # Install nvm, then:
   nvm install 18
   nvm use 18
   ```

---

## Runtime Issues

### Server Won't Start

**Symptom**: `Address already in use` or port binding error

**Solutions**:

1. **Find and kill existing process**:
   ```bash
   # Linux/macOS
   lsof -i :8000
   kill -9 <PID>

   # Windows
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

2. **Use different port**:
   ```bash
   python -m uvicorn backend.api:app --port 8001
   ```

### Videos Not Loading

**Symptom**: Empty video grid, loading spinner never stops

**Solutions**:

1. **Check working directory**:
   - Verify path in Settings
   - Ensure videos exist in directory
   - Check file extensions are supported

2. **Supported formats**:
   - `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`, `.flv`, `.wmv`, `.m4v`, `.mpeg`, `.mpg`, `.3gp`, `.gif`

3. **File permissions**:
   ```bash
   # Linux/macOS
   chmod -R 755 /path/to/videos
   ```

4. **Browser console** (F12):
   - Check for network errors
   - Look for CORS issues

### Thumbnails Not Generating

**Symptom**: Broken image icons instead of thumbnails

**Solutions**:

1. **Check ffmpeg installation**:
   ```bash
   ffmpeg -version
   ```
   If not installed:
   - Windows: Download from ffmpeg.org, add to PATH
   - Linux: `sudo apt install ffmpeg`
   - macOS: `brew install ffmpeg`

2. **Clear thumbnail cache**:
   ```bash
   # Via API
   curl -X DELETE http://localhost:8000/api/thumbnails/cache

   # Or manually
   rm -rf .thumbnail_cache/
   ```

3. **Check video file integrity**:
   ```bash
   ffprobe video.mp4
   ```

---

## Processing Issues

### Out of Memory (CUDA OOM)

**Symptom**: `CUDA out of memory` error during processing

**Solutions**:

1. **Reduce settings** (in order of impact):
   ```json
   {
     "max_frames": 32,      // Reduce from 128
     "frame_size": 224,     // Reduce from 336
     "dtype": "float16",    // Change from bfloat16
     "use_torch_compile": false
   }
   ```

2. **Clear CUDA cache**:
   ```python
   import torch
   torch.cuda.empty_cache()
   ```

3. **Close other GPU applications**:
   - Check `nvidia-smi` for other processes
   - Close browsers, games, other ML workloads

4. **Unload and reload model**:
   - Click "Unload Model" in UI
   - Wait for VRAM to free
   - Process again

### Processing Stuck

**Symptom**: Progress bar stops moving, no error shown

**Solutions**:

1. **Check console output** for errors

2. **Stop and restart**:
   - Click "Stop" button
   - Wait for cleanup
   - Start again

3. **Restart server**:
   ```bash
   # Stop with Ctrl+C
   # Start again
   python -m uvicorn backend.api:app --host 0.0.0.0 --port 8000
   ```

4. **Check specific video**:
   - Try processing a different video
   - Corrupted video may cause hangs

### Slow Generation Speed

**Symptom**: Very slow token generation (<5 tokens/sec)

**Solutions**:

1. **Enable optimizations**:
   ```json
   {
     "use_torch_compile": true
   }
   ```
   Note: First run will be slow (compilation), subsequent runs faster.

2. **Check GPU utilization**:
   ```bash
   watch -n 1 nvidia-smi
   ```
   GPU should be near 100% during generation.

3. **Reduce context size**:
   - Lower `max_frames`
   - Lower `frame_size`

4. **Check for thermal throttling**:
   - GPU temperature should be <85°C
   - Improve cooling if needed

### Poor Caption Quality

**Symptom**: Captions are inaccurate, too short, or repetitive

**Solutions**:

1. **Increase frames**:
   ```json
   {
     "max_frames": 128,  // or higher
     "frame_size": 448   // better detail
   }
   ```

2. **Adjust temperature**:
   - `0.0-0.3`: More consistent, may be repetitive
   - `0.5-0.7`: More varied, creative

3. **Improve prompt**:
   ```
   Describe this video in detail. Include:
   - Main subjects and their actions
   - Setting and environment
   - Key objects and their relationships
   - Timeline of events
   - Notable visual details
   ```

4. **Increase token limit**:
   ```json
   {
     "max_tokens": 1024  // Allow longer descriptions
   }
   ```

---

## Network Issues

### WebSocket Disconnects

**Symptom**: Progress updates stop, "Disconnected" status

**Solutions**:

1. **Check connection** in browser DevTools → Network → WS

2. **Firewall settings**:
   - Allow port 8000 for WebSocket
   - Check corporate firewall rules

3. **Proxy configuration**:
   - WebSocket may not work through some proxies
   - Try direct connection

4. **Automatic reconnection**:
   - The UI attempts reconnection automatically
   - Wait a few seconds

### CORS Errors

**Symptom**: `Access-Control-Allow-Origin` errors in console

**Solutions**:

1. **Development mode**: Vite proxy should handle this

2. **Production**: Ensure frontend is served from same origin

3. **Manual fix** (not recommended for production):
   ```python
   # In backend/api.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

## Configuration Issues

### Settings Not Saving

**Symptom**: Settings reset after restart

**Solutions**:

1. **Check file permissions**:
   ```bash
   ls -la settings.json
   # Should be writable
   ```

2. **Verify JSON validity**:
   ```bash
   python -c "import json; json.load(open('settings.json'))"
   ```

3. **Check disk space**

### Prompt Library Empty

**Symptom**: No saved prompts appear

**Solutions**:

1. **Check file exists**:
   ```bash
   cat prompt_library.json
   ```

2. **Initialize if missing**:
   ```bash
   echo "[]" > prompt_library.json
   ```

3. **Verify JSON format**:
   ```bash
   python -c "import json; json.load(open('prompt_library.json'))"
   ```

---

## Multi-GPU Issues

### Only One GPU Used

**Symptom**: With batch_size > 1, only one GPU shows activity

**Solutions**:

1. **Verify GPU detection**:
   ```bash
   curl http://localhost:8000/api/system/gpu
   ```
   Should show all GPUs.

2. **Check CUDA_VISIBLE_DEVICES**:
   ```bash
   echo $CUDA_VISIBLE_DEVICES
   # Should be unset or list all GPUs: "0,1,2,3"
   ```

3. **Verify batch_size setting**:
   ```json
   {
     "batch_size": 2  // Match GPU count
   }
   ```

### Multi-GPU OOM

**Symptom**: OOM when using multiple GPUs

**Solutions**:

1. Each GPU needs ~16GB VRAM for Qwen3-VL-8B

2. **Reduce per-GPU load**:
   ```json
   {
     "max_frames": 64,
     "frame_size": 280
   }
   ```

3. **Use fewer GPUs**:
   ```json
   {
     "batch_size": 1  // Use single GPU
   }
   ```

---

## Error Messages

### "Model not found"

```
Error: Model 'Qwen/Qwen3-VL-8B-Instruct' not found
```

**Solutions**:
1. Check internet connection
2. Manually download:
   ```bash
   python -c "from huggingface_hub import snapshot_download; snapshot_download('Qwen/Qwen3-VL-8B-Instruct', local_dir='./models/Qwen3-VL-8B-Instruct')"
   ```

### "Video codec not supported"

```
Error: Could not open video file
```

**Solutions**:
1. Install ffmpeg with all codecs
2. Re-encode video:
   ```bash
   ffmpeg -i input.mp4 -c:v libx264 -c:a aac output.mp4
   ```

### "Permission denied"

```
Error: Permission denied: '/path/to/file'
```

**Solutions**:
1. Check file/directory permissions
2. Run with appropriate user
3. Don't run as root (creates permission issues)

### "Connection refused"

```
Error: Connection refused to localhost:8000
```

**Solutions**:
1. Ensure server is running
2. Check correct port
3. Verify firewall settings

---

## Getting Help

### Information to Provide

When reporting issues, include:

1. **System info**:
   ```bash
   python --version
   nvidia-smi
   uname -a  # or systeminfo on Windows
   ```

2. **Error messages**: Full traceback

3. **Steps to reproduce**: Exact sequence of actions

4. **Configuration**: Relevant settings (redact sensitive paths)

5. **Logs**: Console output from both backend and frontend

### Debug Mode

Enable verbose logging:
```bash
# Set environment variable
export LOG_LEVEL=DEBUG

# Or in Python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Report Issues

GitHub Issues: [https://github.com/your-repo/video-caption-suite/issues](https://github.com/your-repo/video-caption-suite/issues)
