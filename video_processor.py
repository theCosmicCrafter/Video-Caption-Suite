"""
Video Processing Utilities
Extract and process frames from video files
"""

import cv2
import numpy as np
from PIL import Image
from pathlib import Path
from typing import List, Optional, Tuple
import time

import config


def get_video_info(video_path: Path) -> dict:
    """
    Get information about a video file.

    Args:
        video_path: Path to video file

    Returns:
        Dict with video metadata
    """
    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")

    info = {
        "path": str(video_path),
        "name": video_path.name,
        "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        "fps": cap.get(cv2.CAP_PROP_FPS),
        "frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
        "duration": None,
    }

    if info["fps"] > 0:
        info["duration"] = info["frame_count"] / info["fps"]

    cap.release()
    return info


def extract_frames(
    video_path: Path,
    max_frames: int = None,
    frame_size: int = None,
    sample_method: str = "uniform",
) -> List[Image.Image]:
    """
    Extract frames from a video file.

    Args:
        video_path: Path to video file
        max_frames: Maximum number of frames to extract (default: from config)
        frame_size: Target frame size in pixels (default: from config)
        sample_method: "uniform" for even sampling, "first_last" to preserve endpoints

    Returns:
        List of PIL Images
    """
    max_frames = max_frames or config.MAX_FRAMES_PER_VIDEO
    frame_size = frame_size or config.FRAME_SIZE

    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if total_frames == 0:
        cap.release()
        raise ValueError(f"Video has no frames: {video_path}")

    # Determine which frames to extract
    if total_frames <= max_frames:
        # Use all frames
        frame_indices = list(range(total_frames))
    elif sample_method == "uniform":
        # Uniform sampling
        frame_indices = np.linspace(0, total_frames - 1, max_frames, dtype=int).tolist()
    elif sample_method == "first_last":
        # Keep first and last, uniform sample the rest
        if max_frames <= 2:
            frame_indices = [0, total_frames - 1][:max_frames]
        else:
            middle_count = max_frames - 2
            middle_indices = np.linspace(1, total_frames - 2, middle_count, dtype=int).tolist()
            frame_indices = [0] + middle_indices + [total_frames - 1]
    else:
        raise ValueError(f"Unknown sample method: {sample_method}")

    # Extract frames
    frames = []
    for idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()

        if not ret:
            continue

        # Convert BGR to RGB
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Convert to PIL
        pil_frame = Image.fromarray(frame)

        # Resize if needed
        pil_frame = resize_image(pil_frame, max_size=frame_size)

        frames.append(pil_frame)

    cap.release()

    if not frames:
        raise ValueError(f"Could not extract any frames from: {video_path}")

    return frames


def resize_image(
    image: Image.Image,
    max_size: int = 448,
    min_size: int = 224,
) -> Image.Image:
    """
    Resize image while preserving aspect ratio.

    Args:
        image: PIL Image
        max_size: Maximum dimension
        min_size: Minimum dimension

    Returns:
        Resized PIL Image
    """
    width, height = image.size

    # Calculate scale factor
    max_dim = max(width, height)
    min_dim = min(width, height)

    if max_dim > max_size:
        scale = max_size / max_dim
    elif min_dim < min_size:
        scale = min_size / min_dim
    else:
        return image  # No resize needed

    new_width = int(width * scale)
    new_height = int(height * scale)

    return image.resize((new_width, new_height), Image.Resampling.LANCZOS)


def find_videos(directory: Path = None, traverse_subfolders: bool = False) -> List[Path]:
    """
    Find all video files in a directory.

    Args:
        directory: Directory to search (default: config.INPUT_DIR)
        traverse_subfolders: If True, recursively search subdirectories

    Returns:
        List of video file paths
    """
    directory = directory or config.INPUT_DIR

    if not directory.exists():
        return []

    videos = []
    # Use ** for recursive glob if traverse_subfolders is True
    glob_pattern = "**/*{}" if traverse_subfolders else "*{}"

    for ext in config.VIDEO_EXTENSIONS:
        videos.extend(directory.glob(glob_pattern.format(ext)))

    # Remove duplicates (Windows is case-insensitive) and sort
    seen = set()
    unique_videos = []
    for v in videos:
        # Use full path for uniqueness when traversing subfolders
        key = str(v).lower() if traverse_subfolders else v.name.lower()
        if key not in seen:
            seen.add(key)
            unique_videos.append(v)

    unique_videos.sort(key=lambda p: str(p).lower())
    return unique_videos


def process_video(
    video_path: Path,
    max_frames: int = None,
    frame_size: int = None,
) -> Tuple[List[Image.Image], dict]:
    """
    Process a video file: extract frames and return with metadata.

    Args:
        video_path: Path to video file
        max_frames: Maximum frames to extract
        frame_size: Target frame size

    Returns:
        Tuple of (frames_list, metadata_dict)
    """
    start_time = time.time()

    # Get video info
    info = get_video_info(video_path)

    # Extract frames
    frames = extract_frames(
        video_path,
        max_frames=max_frames,
        frame_size=frame_size,
    )

    process_time = time.time() - start_time

    metadata = {
        **info,
        "frames_extracted": len(frames),
        "frame_size": frame_size or config.FRAME_SIZE,
        "process_time": process_time,
    }

    return frames, metadata


if __name__ == "__main__":
    # Test video processing
    print("Searching for videos in input_videos/...")

    videos = find_videos()

    if not videos:
        print("No videos found. Place videos in input_videos/ directory.")
    else:
        print(f"Found {len(videos)} video(s):")
        for v in videos:
            print(f"  - {v.name}")

        # Test processing first video
        print(f"\nTesting frame extraction on: {videos[0].name}")
        frames, meta = process_video(videos[0])
        print(f"  Resolution: {meta['width']}x{meta['height']}")
        print(f"  Duration: {meta['duration']:.1f}s" if meta['duration'] else "  Duration: Unknown")
        print(f"  Total frames: {meta['frame_count']}")
        print(f"  Extracted: {meta['frames_extracted']} frames")
        print(f"  Process time: {meta['process_time']:.2f}s")
