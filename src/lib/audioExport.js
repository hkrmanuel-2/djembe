// Audio export utility for mixing and exporting projects as MP3/WAV

/**
 * Load audio file and decode to AudioBuffer
 */
async function loadAudioBuffer(audioContext, url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('Error loading audio:', error);
    throw new Error(`Failed to load audio: ${url}`);
  }
}

/**
 * Convert seconds to beat position based on BPM
 */
function secondsToBeat(seconds, bpm) {
  const secondsPerBeat = 60 / bpm;
  return seconds / secondsPerBeat;
}

/**
 * Convert beat position to seconds based on BPM
 */
function beatToSeconds(beat, bpm) {
  const secondsPerBeat = 60 / bpm;
  return beat * secondsPerBeat;
}

/**
 * Convert grid column to beat position
 */
function gridColToBeat(col, subdivisionsPerBeat = 4) {
  return col / subdivisionsPerBeat;
}

/**
 * Mix multiple audio buffers into a single buffer
 */
function mixAudioBuffers(audioContext, buffers, startTimes, durations) {
  // Find the total duration needed
  const maxEndTime = Math.max(...startTimes.map((start, i) => start + durations[i]));
  const totalDuration = Math.max(maxEndTime, 0.1); // Minimum 0.1 seconds
  
  // Create output buffer
  const sampleRate = audioContext.sampleRate;
  const frameCount = Math.ceil(totalDuration * sampleRate);
  const outputBuffer = audioContext.createBuffer(2, frameCount, sampleRate); // Stereo
  
  // Mix each buffer into the output
  buffers.forEach((buffer, index) => {
    const startTime = startTimes[index];
    const startFrame = Math.floor(startTime * sampleRate);
    const sourceFrames = buffer.length;
    const endFrame = Math.min(startFrame + sourceFrames, frameCount);
    
    // Copy and mix audio data
    for (let channel = 0; channel < Math.min(buffer.numberOfChannels, 2); channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = outputBuffer.getChannelData(channel);
      
      for (let i = 0; i < sourceFrames && (startFrame + i) < frameCount; i++) {
        const outputIndex = startFrame + i;
        // Mix (add) the audio samples
        outputData[outputIndex] += inputData[i] * 0.7; // Apply volume (0.7 = 70%)
      }
    }
  });
  
  return outputBuffer;
}

/**
 * Convert AudioBuffer to WAV format
 */
function audioBufferToWav(buffer) {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  // RIFF identifier
  setUint32(0x46464952); // "RIFF"
  setUint32(length * numberOfChannels * 2 + 36); // File size - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // fmt chunk size
  setUint16(1); // Audio format (1 = PCM)
  setUint16(numberOfChannels);
  setUint32(sampleRate);
  setUint32(sampleRate * numberOfChannels * 2); // Byte rate
  setUint16(numberOfChannels * 2); // Block align
  setUint16(16); // Bits per sample
  setUint32(0x61746164); // "data" chunk
  setUint32(length * numberOfChannels * 2);

  // Write audio data
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < arrayBuffer.byteLength) {
    for (let i = 0; i < numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return arrayBuffer;
}

/**
 * Convert AudioBuffer to MP3 using lamejs
 */
async function audioBufferToMp3(buffer) {
  try {
    // Dynamic import of lamejs
    const lamejs = await import('lamejs');
    const mp3encoder = new lamejs.Mp3Encoder(2, buffer.sampleRate, 128); // Stereo, sample rate, bitrate
    
    const samples = [];
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : leftChannel;
    
    // Convert float samples to 16-bit PCM
    const sampleBlockSize = 1152; // MP3 frame size
    for (let i = 0; i < leftChannel.length; i += sampleBlockSize) {
      const leftChunk = new Int16Array(
        leftChannel.subarray(i, i + sampleBlockSize).map(n => Math.max(-1, Math.min(1, n)) * 0x7fff)
      );
      const rightChunk = new Int16Array(
        rightChannel.subarray(i, i + sampleBlockSize).map(n => Math.max(-1, Math.min(1, n)) * 0x7fff)
      );
      
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        samples.push(mp3buf);
      }
    }
    
    // Flush remaining data
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      samples.push(mp3buf);
    }
    
    // Combine all MP3 data
    const mp3Data = new Uint8Array(samples.reduce((acc, buf) => acc + buf.length, 0));
    let offset = 0;
    for (const buf of samples) {
      mp3Data.set(buf, offset);
      offset += buf.length;
    }
    
    return new Blob([mp3Data], { type: 'audio/mp3' });
  } catch (error) {
    console.error('MP3 encoding error:', error);
    throw new Error('Failed to encode MP3. Falling back to WAV.');
  }
}

/**
 * Export project as audio file (MP3 or WAV format)
 * @param {Array} placedLoops - Array of placed loops with col, span, url, etc.
 * @param {number} bpm - Project BPM
 * @param {number} bars - Number of bars in project
 * @param {string} filename - Output filename
 * @param {string} format - Export format: 'mp3' or 'wav' (default: 'mp3')
 */
export async function exportProjectAsAudio(placedLoops, bpm, bars, filename = 'project', format = 'mp3') {
  if (!placedLoops || placedLoops.length === 0) {
    throw new Error('No loops to export');
  }

  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const subdivisionsPerBeat = 4;
    const beatsPerBar = 4;
    const totalBeats = bars * beatsPerBar;
    const totalDuration = beatToSeconds(totalBeats, bpm);

    // Load all audio buffers
    const buffers = [];
    const startTimes = [];
    const durations = [];

    for (const loop of placedLoops) {
      if (!loop.url) {
        console.warn(`Loop ${loop.id} has no URL, skipping`);
        continue;
      }

      try {
        const buffer = await loadAudioBuffer(audioContext, loop.url);
        const startBeat = gridColToBeat(loop.col, subdivisionsPerBeat);
        const spanBeats = gridColToBeat(loop.span, subdivisionsPerBeat);
        const startTime = beatToSeconds(startBeat, bpm);
        const duration = beatToSeconds(spanBeats, bpm);

        buffers.push(buffer);
        startTimes.push(startTime);
        durations.push(Math.min(duration, buffer.duration)); // Use actual buffer duration if shorter
      } catch (error) {
        console.error(`Failed to load loop ${loop.id}:`, error);
        // Continue with other loops
      }
    }

    if (buffers.length === 0) {
      throw new Error('No valid audio loops to export');
    }

    // Mix all buffers
    const mixedBuffer = mixAudioBuffers(audioContext, buffers, startTimes, durations);

    // Trim to project duration
    const sampleRate = audioContext.sampleRate;
    const projectFrames = Math.ceil(totalDuration * sampleRate);
    const trimmedBuffer = audioContext.createBuffer(
      mixedBuffer.numberOfChannels,
      Math.min(projectFrames, mixedBuffer.length),
      sampleRate
    );

    for (let channel = 0; channel < mixedBuffer.numberOfChannels; channel++) {
      const sourceData = mixedBuffer.getChannelData(channel);
      const targetData = trimmedBuffer.getChannelData(channel);
      for (let i = 0; i < targetData.length; i++) {
        targetData[i] = sourceData[i];
      }
    }

    // Export in requested format
    let blob;
    let extension;
    
    if (format === 'mp3') {
      try {
        blob = await audioBufferToMp3(trimmedBuffer);
        extension = 'mp3';
      } catch (error) {
        console.warn('MP3 encoding failed, falling back to WAV:', error);
        // Fallback to WAV
        const wavArrayBuffer = audioBufferToWav(trimmedBuffer);
        blob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
        extension = 'wav';
      }
    } else {
      // Export as WAV
      const wavArrayBuffer = audioBufferToWav(trimmedBuffer);
      blob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
      extension = 'wav';
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Clean up
    audioContext.close();

    return { success: true, format: extension };
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}
