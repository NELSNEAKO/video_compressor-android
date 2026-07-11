import { registerPlugin, Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { formatBytes } from './formatBytes.js'
import { getCompressionPreset } from './compressionPresets.js'

const VideoReencoder = registerPlugin('VideoReencoder')

function formatDuration(ms) {
  const seconds = ms / 1000
  if (seconds < 10) return `${seconds.toFixed(1)}s`
  return `${Math.round(seconds)}s`
}

function buildResult(originalBytes, compressedBytes, elapsedMs) {
  const percentReduced = originalBytes > 0
    ? Math.max(0, Math.round((1 - compressedBytes / originalBytes) * 100))
    : 0

  return {
    originalSize: formatBytes(originalBytes),
    compressedSize: formatBytes(compressedBytes),
    percentReduced,
    compressionTime: formatDuration(elapsedMs),
  }
}

async function compressVideoMock({ file, size, mode, onProgress }) {
  const preset = getCompressionPreset(mode)
  const originalBytes = Number(size) || file?.size || 0
  const startedAt = Date.now()
  let current = 0

  await new Promise((resolve) => {
    const interval = setInterval(() => {
      current = Math.min(current + 10, 100)
      onProgress?.(current)
      if (current >= 100) {
        clearInterval(interval)
        resolve()
      }
    }, 250)
  })

  const compressedBytes = Math.round(originalBytes * (1 - preset.estimatedReduction))
  return {
    ...buildResult(originalBytes, compressedBytes, Date.now() - startedAt),
    outputPath: null,
  }
}

/**
 * Native path: pass content:// URI straight to Media3 — no Base64 / full-file JS load.
 * Output still lands in app cache as a real file for the Save dialog.
 */
async function compressVideoNative({ uri, size, mode, onProgress }) {
  if (!uri) {
    throw new Error('No video URI available. Select the video again.')
  }

  const preset = getCompressionPreset(mode)
  const stamp = Date.now()
  const outputName = `vc-output-${stamp}.mp4`
  const originalBytes = Number(size) || 0
  const startedAt = Date.now()

  onProgress?.(2)

  const outputUri = await Filesystem.getUri({
    path: outputName,
    directory: Directory.Cache,
  })

  onProgress?.(8)

  let jobId = null
  let listenerHandle = null

  try {
    const result = await new Promise(async (resolve, reject) => {
      listenerHandle = await VideoReencoder.addListener('progress', (event) => {
        if (jobId && event.jobId !== jobId) return

        if (typeof event.progress === 'number') {
          const mapped = Math.min(99, Math.max(8, Math.round(event.progress * 100)))
          onProgress?.(mapped)
        }

        if (event.state === 'completed') {
          resolve({
            outputPath: event.outputPath,
            outputSize: Number(event.outputSize) || 0,
          })
          return
        }

        if (event.state === 'failed') {
          reject(new Error(event.message || 'Video compression failed'))
        }
      })

      try {
        const accepted = await VideoReencoder.reencodeVideo({
          inputPath: uri,
          outputPath: outputUri.uri,
          bitrate: preset.bitrate,
          inputSize: originalBytes,
        })
        jobId = accepted?.jobId ?? null
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error?.message || error)))
      }
    })

    onProgress?.(100)

    let compressedBytes = result.outputSize
    if (!compressedBytes) {
      try {
        const stat = await Filesystem.stat({
          path: outputName,
          directory: Directory.Cache,
        })
        compressedBytes = Number(stat.size) || 0
      } catch {
        compressedBytes = 0
      }
    }

    return {
      ...buildResult(originalBytes, compressedBytes, Date.now() - startedAt),
      outputPath: result.outputPath,
    }
  } finally {
    if (listenerHandle) {
      await listenerHandle.remove()
    }
  }
}

/**
 * Compress a picked video.
 * Browser: mock progress + estimated sizes.
 * Android (native): Media3 Transformer via content URI (streams; no Base64).
 *
 * @param {{ file?: File|null, uri?: string|null, size?: number, mode: string, onProgress?: (n: number) => void }} options
 */
export async function compressVideo(options) {
  if (Capacitor.isNativePlatform()) {
    return compressVideoNative(options)
  }
  return compressVideoMock(options)
}
