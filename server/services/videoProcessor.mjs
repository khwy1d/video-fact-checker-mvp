import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function downloadVideo(videoUrl) {
  const tempDir = os.tmpdir();
  const videoId = Math.random().toString(36).substring(7);
  const outputPath = path.join(tempDir, `video_${videoId}.mp4`);

  try {
    const command = `yt-dlp -f 'best[ext=mp4]' -o '${outputPath}' '${videoUrl}' 2>&1`;
    const { stdout, stderr } = await execAsync(command);

    console.log('Download output:', stdout);
    return outputPath;
  } catch (error) {
    throw new Error(`Video download failed: ${error.message}`);
  }
}

export async function extractAudio(videoPath) {
  const audioPath = videoPath.replace('.mp4', '_audio.mp3');

  try {
    const command = `ffmpeg -i '${videoPath}' -q:a 9 -n '${audioPath}' 2>&1`;
    await execAsync(command);
    return audioPath;
  } catch (error) {
    throw new Error(`Audio extraction failed: ${error.message}`);
  }
}

export function mergeContent(transcript, ocrText) {
  const parts = [];
  if (transcript) {
    parts.push(`TRANSCRIPT:\n${transcript}`);
  }
  if (ocrText) {
    parts.push(`\n\nOCR TEXT:\n${ocrText}`);
  }
  return parts.join('');
}

export async function extractVideoMetadata(videoUrl) {
  try {
    const command = `yt-dlp --dump-json '${videoUrl}' 2>&1`;
    const { stdout } = await execAsync(command);
    const metadata = JSON.parse(stdout);
    return {
      title: metadata.title,
      thumbnail: metadata.thumbnail,
    };
  } catch (error) {
    console.warn(`Failed to extract metadata: ${error.message}`);
    return {};
  }
}

export async function processVideo(videoUrl) {
  let videoPath = null;
  let audioPath = null;

  try {
    console.log('Step 1: Downloading video...');
    videoPath = await downloadVideo(videoUrl);
    console.log('Video downloaded:', videoPath);

    console.log('Step 2: Extracting metadata...');
    const metadata = await extractVideoMetadata(videoUrl);

    console.log('Step 3: Extracting audio...');
    audioPath = await extractAudio(videoPath);
    console.log('Audio extracted:', audioPath);

    console.log('Step 4: Processing complete');
    const mergedContent = `Video processed: ${metadata.title || 'Unknown'}`;

    return {
      transcript: 'Placeholder transcript - Whisper integration pending',
      ocrText: 'Placeholder OCR - OCR integration pending',
      mergedContent,
      videoTitle: metadata.title,
      videoThumbnail: metadata.thumbnail,
    };
  } finally {
    if (videoPath) {
      try {
        await unlink(videoPath);
      } catch (e) {
        console.warn(`Failed to delete video: ${videoPath}`);
      }
    }
    if (audioPath) {
      try {
        await unlink(audioPath);
      } catch (e) {
        console.warn(`Failed to delete audio: ${audioPath}`);
      }
    }
  }
}
