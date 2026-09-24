export interface MediaDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape' | 'square';
  ratioLabel: string;
}

/**
 * Calculates greatest common divisor for aspect ratio formatting
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Determine human-readable ratio label from width and height
 */
export function getRatioLabel(width: number, height: number): string {
  if (!width || !height) return 'Auto';
  const ratio = width / height;

  if (Math.abs(ratio - 9 / 16) < 0.04) return '9:16 (Vertical Reel/Story)';
  if (Math.abs(ratio - 4 / 5) < 0.04) return '4:5 (Vertical Portrait)';
  if (Math.abs(ratio - 3 / 4) < 0.04) return '3:4 (Portrait)';
  if (Math.abs(ratio - 2 / 3) < 0.04) return '2:3 (Poster)';
  if (Math.abs(ratio - 1) < 0.04) return '1:1 (Square)';
  if (Math.abs(ratio - 4 / 3) < 0.04) return '4:3 (Standard)';
  if (Math.abs(ratio - 16 / 9) < 0.04) return '16:9 (Landscape Cinematic)';
  if (Math.abs(ratio - 21 / 9) < 0.06) return '21:9 (Ultrawide)';

  // Calculate reduced ratio
  const divisor = gcd(Math.round(width), Math.round(height));
  const simW = Math.round(width / divisor);
  const simH = Math.round(height / divisor);
  if (simW < 50 && simH < 50) {
    return `${simW}:${simH}`;
  }

  return `${ratio.toFixed(2)}:1`;
}

/**
 * Build a structured MediaDimensions object
 */
export function calculateMediaDimensions(width: number, height: number): MediaDimensions {
  const safeW = Math.max(1, Math.round(width));
  const safeH = Math.max(1, Math.round(height));
  const aspectRatio = parseFloat((safeW / safeH).toFixed(4));

  let orientation: 'portrait' | 'landscape' | 'square' = 'landscape';
  if (Math.abs(aspectRatio - 1) < 0.03) {
    orientation = 'square';
  } else if (aspectRatio < 1) {
    orientation = 'portrait';
  } else {
    orientation = 'landscape';
  }

  return {
    width: safeW,
    height: safeH,
    aspectRatio,
    orientation,
    ratioLabel: getRatioLabel(safeW, safeH),
  };
}

/**
 * Detect media dimensions from an image buffer in Node.js (PNG, JPEG, WebP, GIF, SVG)
 */
export function detectImageDimensionsFromBuffer(buffer: Buffer): MediaDimensions | null {
  try {
    if (!buffer || buffer.length < 24) return null;

    // 1. PNG
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return calculateMediaDimensions(width, height);
    }

    // 2. JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF0, SOF1, SOF2 markers
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          if (width > 0 && height > 0) {
            return calculateMediaDimensions(width, height);
          }
        }
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += 2 + segmentLength;
      }
    }

    // 3. GIF
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 // "GIF"
    ) {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return calculateMediaDimensions(width, height);
    }

    // 4. WebP
    if (
      buffer.length >= 30 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      const chunkType = buffer.toString('ascii', 12, 16);

      // Lossy VP8
      if (chunkType === 'VP8 ') {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return calculateMediaDimensions(width, height);
      }

      // Lossless VP8L
      if (chunkType === 'VP8L') {
        const b1 = buffer[21];
        const b2 = buffer[22];
        const b3 = buffer[23];
        const b4 = buffer[24];
        const width = 1 + (((b2 & 0x3f) << 8) | b1);
        const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
        return calculateMediaDimensions(width, height);
      }

      // Extended VP8X
      if (chunkType === 'VP8X') {
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        return calculateMediaDimensions(width, height);
      }
    }

    // 5. SVG
    const snippet = buffer.slice(0, 1024).toString('utf-8');
    if (snippet.includes('<svg')) {
      const viewBoxMatch = snippet.match(/viewBox=["']([0-9. -]+)["']/i);
      if (viewBoxMatch) {
        const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          return calculateMediaDimensions(parts[2], parts[3]);
        }
      }
      const widthMatch = snippet.match(/width=["']([0-9.]+)["']/i);
      const heightMatch = snippet.match(/height=["']([0-9.]+)["']/i);
      if (widthMatch && heightMatch) {
        return calculateMediaDimensions(parseFloat(widthMatch[1]), parseFloat(heightMatch[1]));
      }
    }
  } catch (err) {
    console.warn('Failed to parse image dimensions from buffer:', err);
  }

  return null;
}

/**
 * Client-side browser detector for Image or Video files and URLs
 */
export async function detectMediaDimensionsClient(
  source: File | string
): Promise<MediaDimensions | null> {
  if (typeof window === 'undefined') return null;

  return new Promise((resolve) => {
    let isVideo = false;
    let url = '';

    if (typeof source === 'string') {
      url = source;
      const clean = source.split('?')[0].toLowerCase();
      if (clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v')) {
        isVideo = true;
      }
    } else {
      url = URL.createObjectURL(source);
      if (source.type.startsWith('video/')) {
        isVideo = true;
      }
    }

    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const cleanup = () => {
        if (typeof source !== 'string') {
          URL.revokeObjectURL(url);
        }
      };

      video.onloadedmetadata = () => {
        const w = video.videoWidth;
        const h = video.videoHeight;
        cleanup();
        if (w > 0 && h > 0) {
          resolve(calculateMediaDimensions(w, h));
        } else {
          resolve(null);
        }
      };

      video.onerror = () => {
        cleanup();
        resolve(null);
      };

      video.src = url;
    } else {
      const img = new Image();
      const cleanup = () => {
        if (typeof source !== 'string') {
          URL.revokeObjectURL(url);
        }
      };

      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        cleanup();
        if (w > 0 && h > 0) {
          resolve(calculateMediaDimensions(w, h));
        } else {
          resolve(null);
        }
      };

      img.onerror = () => {
        cleanup();
        resolve(null);
      };

      img.src = url;
    }
  });
}
