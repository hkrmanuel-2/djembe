import { useEffect, useRef } from 'react';
import { logger } from "@/lib/logger";

export default function Waveform({ audioUrl, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const canvasWidth = width || 200;
    const canvasHeight = height || 80;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let audioContext = null;
    let cancelled = false;

    const generateWaveform = async () => {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error('Failed to fetch audio');
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        if (cancelled) return;
        
        // Get raw audio data
        const rawData = audioBuffer.getChannelData(0);
        const samples = Math.min(300, Math.floor(canvasWidth / 2)); // Adaptive sample count
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];

        // Downsample and get peak values
        for (let i = 0; i < samples; i++) {
          let max = 0;
          for (let j = 0; j < blockSize; j++) {
            const index = i * blockSize + j;
            if (index < rawData.length) {
              const value = Math.abs(rawData[index]);
              max = Math.max(max, value);
            }
          }
          filteredData.push(max);
        }

        if (cancelled) return;

        // Normalize
        const maxValue = Math.max(...filteredData, 0.001); // Avoid division by zero
        const normalized = filteredData.map(val => Math.min(1, val / maxValue));

        // Draw waveform
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 1;

        const barWidth = canvas.width / samples;
        const centerY = canvas.height / 2;
        const maxBarHeight = canvas.height * 0.7;

        normalized.forEach((value, i) => {
          const barHeight = value * maxBarHeight;
          const x = i * barWidth;
          
          // Draw bar (centered)
          if (barHeight > 0.5) { // Only draw if significant
            ctx.fillRect(x, centerY - barHeight / 2, Math.max(1, barWidth - 1), barHeight);
          }
        });

      } catch (error) {
        if (!cancelled) {
          logger.warn('Failed to generate waveform:', error);
          // Draw a simple line as fallback
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
        }
      } finally {
        if (audioContext) {
          audioContext.close().catch(() => {});
        }
      }
    };

    generateWaveform();

    return () => {
      cancelled = true;
      if (audioContext) {
        audioContext.close().catch(() => {});
      }
    };
  }, [audioUrl, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
