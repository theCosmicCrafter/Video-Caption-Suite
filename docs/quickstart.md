# Quick Start Guide

Get up and running with Video Caption Suite in minutes.

## Prerequisites

- NVIDIA GPU with 16GB+ VRAM
- Python 3.10+ installed
- CUDA 11.8+ installed

## 5-Minute Setup

### Step 1: Install

**Windows**:
```powershell
git clone https://github.com/your-repo/video-caption-suite.git
cd video-caption-suite
.\install.bat
```

**Linux/macOS**:
```bash
git clone https://github.com/your-repo/video-caption-suite.git
cd video-caption-suite
chmod +x install.sh && ./install.sh
```

### Step 2: Start

**Windows**:
```powershell
.\start.bat
```

**Linux/macOS**:
```bash
./start.sh
```

### Step 3: Open

Navigate to `http://localhost:8000` in your browser.

---

## Basic Workflow

### 1. Set Your Video Directory

1. Click the **Settings** gear icon in the sidebar
2. Under **Directory Settings**, click **Browse**
3. Navigate to and select your folder containing videos
4. Click **Select**

Your videos will appear in the main grid.

### 2. Select Videos

- **Click** a video tile to select/deselect it
- **Shift+Click** to select a range
- Use the toolbar to **Select All** or **Select Uncaptioned**

### 3. Configure Caption Settings (Optional)

In the Settings panel:

- **Max Frames**: How many frames to analyze (more = better accuracy, slower)
- **Temperature**: 0 = consistent, 1 = creative
- **Prompt**: Customize what the AI should describe

### 4. Start Processing

1. Click the **Process Selected** button
2. Watch progress in real-time:
   - Current video being processed
   - Tokens generated
   - VRAM usage
3. Captions are saved as `.txt` files next to each video

### 5. View Captions

- Click any video with a caption (indicated by a checkmark)
- The caption panel opens on the right
- View, copy, or edit the generated caption

---

## Example Session

```
1. Start application         → localhost:8000
2. Set directory             → C:/Users/me/Videos/Training
3. Videos load               → 50 videos displayed
4. Select all uncaptioned    → 35 videos selected
5. Click Process Selected    → Processing begins
6. Wait ~10 minutes          → All videos captioned
7. Review captions           → Click any video to view
```

---

## Tips for Best Results

### Prompt Engineering

The prompt significantly affects output quality. Examples:

**Basic Description**:
```
Describe this video in detail.
```

**Structured Output**:
```
Describe this video with:
- Main subject and actions
- Setting/location
- Notable objects
- Mood/atmosphere
```

**Training Data Format**:
```
Write a detailed caption for AI training. Focus only on
visible elements. No speculation. Be factual and precise.
```

### Optimal Settings

| Video Type        | Max Frames | Frame Size | Notes                    |
|-------------------|------------|------------|--------------------------|
| Short clips (<30s)| 32-64      | 336        | Quick processing         |
| Medium (30s-5min) | 64-128     | 336        | Good balance             |
| Long (>5min)      | 128-256    | 336        | Captures more content    |
| High detail       | 128        | 448        | Better visual fidelity   |

### Multi-GPU Processing

If you have multiple GPUs:

1. Go to **Optimization Settings**
2. Increase **Batch Size** to match your GPU count
3. Processing will run in parallel

---

## Common Tasks

### Re-caption a Video

1. Select the video
2. (Optional) Delete existing caption: right-click → Delete Caption
3. Process selected
4. New caption generated

### Batch Process New Videos

1. Add videos to your working directory
2. Click **Refresh** in the toolbar
3. Click **Select Uncaptioned**
4. Process Selected

### Export Captions

Captions are plain text files saved alongside videos:
```
video1.mp4  →  video1.txt
video2.avi  →  video2.txt
```

Copy the `.txt` files wherever needed.

### Change Prompt Mid-Session

1. Stop current processing (if running)
2. Edit the prompt in Settings
3. Select videos to re-process
4. Start processing with new prompt

---

## Troubleshooting Quick Fixes

| Problem                  | Solution                                    |
|--------------------------|---------------------------------------------|
| Videos not showing       | Check working directory, refresh page       |
| Processing stuck         | Click Stop, reduce max_frames, try again    |
| Out of memory            | Reduce max_frames to 32, frame_size to 280  |
| Slow generation          | Enable torch.compile in optimizations       |
| Bad captions             | Adjust prompt, increase max_frames          |

---

## Next Steps

- [Configuration Guide](./configuration.md) - All settings explained
- [Architecture Overview](./architecture.md) - How it works
- [API Reference](./api-reference.md) - Programmatic access
