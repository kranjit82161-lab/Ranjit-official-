// Video Processing & Export Engine using HTML5 Canvas & Web Audio API
// Handles Trimming, 9:16 vs 16:9 Aspect Ratio Transformation, Captions, Music, and Video Export

export interface VideoEditOptions {
  trimStartPercent: number; // e.g. 0 to 50
  trimEndPercent: number;   // e.g. 50 to 100
  aspectRatio: '9:16' | '16:9';
  captionsText: string;
  captionLanguage: 'hindi' | 'english';
  backgroundMusic: 'energetic' | 'lofi' | 'cinematic' | 'none';
  voiceOverText?: string;
  transitionEffect: 'none' | 'cyber_glitch' | 'fade_black' | 'zoom_punch';
  colorFilter: 'none' | 'vibrant_stark' | 'cinematic_teal' | 'monochrome';
}

export interface VideoExportResult {
  file: File;
  previewUrl: string;
  durationSeconds: number;
  width: number;
  height: number;
}

export async function processAndExportVideo(
  sourceFile: File,
  options: VideoEditOptions,
  onProgress?: (percent: number, status: string) => void
): Promise<VideoExportResult> {
  const isVertical = options.aspectRatio === '9:16';
  const targetWidth = isVertical ? 720 : 1280;
  const targetHeight = isVertical ? 1280 : 720;
  const fps = 30;

  // 1. Create Video Element to read source frames
  const videoElement = document.createElement('video');
  videoElement.src = URL.createObjectURL(sourceFile);
  videoElement.muted = false;
  videoElement.playsInline = true;
  videoElement.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    videoElement.onloadedmetadata = () => resolve();
    videoElement.onerror = () => reject(new Error('Failed to load video file in memory.'));
  });

  const sourceDuration = videoElement.duration || 10;
  const startTime = (options.trimStartPercent / 100) * sourceDuration;
  const endTime = Math.max(startTime + 2, (options.trimEndPercent / 100) * sourceDuration);
  const activeDuration = endTime - startTime;

  // 2. Set up Canvas & 2D context
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');

  // 3. Audio Context & Music Synthesis
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioCtx();
  const audioDestination = audioContext.createMediaStreamDestination();

  // Route source video audio if available
  try {
    const sourceNode = audioContext.createMediaElementSource(videoElement);
    sourceNode.connect(audioDestination);
    sourceNode.connect(audioContext.destination);
  } catch {
    // MediaElementSource might already be attached or silent
  }

  // Synthesize Background Music track if chosen
  if (options.backgroundMusic !== 'none') {
    try {
      const now = audioContext.currentTime;
      const baseFreq = options.backgroundMusic === 'energetic' ? 130 : 98;
      const bass = audioContext.createOscillator();
      const bassGain = audioContext.createGain();
      bass.type = options.backgroundMusic === 'energetic' ? 'sawtooth' : 'sine';
      bass.frequency.setValueAtTime(baseFreq, now);
      bassGain.gain.setValueAtTime(0.06, now);

      bass.connect(bassGain);
      bassGain.connect(audioDestination);
      bass.start(now);
      bass.stop(now + activeDuration + 1);

      // Chords / Arpeggio
      const notes = options.backgroundMusic === 'lofi' ? [261.63, 329.63, 392] : [330, 392, 493.88, 587.33];
      for (let t = 0; t < activeDuration; t += 0.5) {
        const osc = audioContext.createOscillator();
        const g = audioContext.createGain();
        osc.frequency.setValueAtTime(notes[Math.floor(t % notes.length)], now + t);
        g.gain.setValueAtTime(0.04, now + t);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
        osc.connect(g);
        g.connect(audioDestination);
        osc.start(now + t);
        osc.stop(now + t + 0.4);
      }
    } catch (e) {
      console.warn('BGM synthesis fallback:', e);
    }
  }

  // 4. MediaRecorder Setup
  const canvasStream = canvas.captureStream(fps);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDestination.stream.getAudioTracks(),
  ]);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm')
    ? 'video/webm'
    : 'video/mp4';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 4_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.start(100);

  // Seek video to startTime
  videoElement.currentTime = startTime;
  await new Promise<void>((resolve) => {
    videoElement.onseeked = () => resolve();
  });

  await videoElement.play().catch(() => {});

  // 5. Render Loop
  return new Promise<VideoExportResult>((resolve, reject) => {
    const totalFrames = Math.round(activeDuration * fps);
    let frame = 0;

    const renderFrame = () => {
      const currentPlaybackTime = videoElement.currentTime;

      if (currentPlaybackTime >= endTime || frame >= totalFrames || videoElement.ended) {
        recorder.stop();
        videoElement.pause();
        return;
      }

      // Draw background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Fit and crop video onto canvas (Letterbox or Aspect Fit Fill)
      const vWidth = videoElement.videoWidth || targetWidth;
      const vHeight = videoElement.videoHeight || targetHeight;

      // Crop center to target aspect ratio
      const videoRatio = vWidth / vHeight;
      const targetRatio = targetWidth / targetHeight;

      let drawW = targetWidth;
      let drawH = targetHeight;
      let drawX = 0;
      let drawY = 0;

      if (videoRatio > targetRatio) {
        // Video is wider than canvas
        drawW = targetHeight * videoRatio;
        drawX = (targetWidth - drawW) / 2;
      } else {
        // Video is taller than canvas
        drawH = targetWidth / videoRatio;
        drawY = (targetHeight - drawH) / 2;
      }

      // Apply Color Filter
      if (options.colorFilter === 'cinematic_teal') {
        ctx.filter = 'contrast(1.15) saturate(1.2) hue-rotate(10deg)';
      } else if (options.colorFilter === 'vibrant_stark') {
        ctx.filter = 'contrast(1.2) saturate(1.35) brightness(1.05)';
      } else if (options.colorFilter === 'monochrome') {
        ctx.filter = 'grayscale(1) contrast(1.25)';
      } else {
        ctx.filter = 'none';
      }

      ctx.drawImage(videoElement, drawX, drawY, drawW, drawH);
      ctx.filter = 'none';

      // Transition effects (e.g. Cyber Glitch or Flash at beginning)
      if (options.transitionEffect === 'cyber_glitch' && frame < 15) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fillRect(0, Math.random() * targetHeight, targetWidth, Math.random() * 40);
      } else if (options.transitionEffect === 'fade_black' && frame < 15) {
        const alpha = 1 - frame / 15;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // Render Dynamic Captions Overlay (Lower Third)
      if (options.captionsText) {
        ctx.save();
        const captionY = isVertical ? targetHeight * 0.78 : targetHeight * 0.82;

        // Subtitle plate
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.beginPath();
        ctx.roundRect(40, captionY - 35, targetWidth - 80, 70, 16);
        ctx.fill();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Caption text
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 24px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.fillText(options.captionsText.slice(0, 55), targetWidth / 2, captionY);
        ctx.restore();
      }

      // Format Stamp badge
      ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
      ctx.fillRect(20, 20, 130, 32);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isVertical ? '9:16 SHORTS' : '16:9 HD', 85, 41);

      frame++;
      if (frame % 15 === 0 && onProgress) {
        const pct = Math.min(99, Math.round((frame / totalFrames) * 100));
        onProgress(pct, `Exporting frame ${frame}/${totalFrames}...`);
      }

      requestAnimationFrame(renderFrame);
    };

    recorder.onstop = () => {
      try {
        audioContext.close();
      } catch {}

      const blob = new Blob(chunks, { type: mimeType });
      const exportName = `jarvis_edited_${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
      const exportedFile = new File([blob], exportName, { type: mimeType });
      const previewUrl = URL.createObjectURL(blob);

      onProgress?.(100, 'Video Export Complete');
      resolve({
        file: exportedFile,
        previewUrl,
        durationSeconds: activeDuration,
        width: targetWidth,
        height: targetHeight,
      });
    };

    recorder.onerror = (err) => {
      reject(new Error('Export failed: ' + (err as any)?.error?.message || 'Recorder error'));
    };

    renderFrame();
  });
}
