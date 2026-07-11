import { registerPlugin, Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { formatBytes } from './formatBytes.js'
import { getCompressionPreset } from './compressionPresets.js'

const VideoReencoder = registerPlugin('VideoReencoder')

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read video file'))
    reader.readAsDataURL(file)
  })
}

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

async function compressVideoMock({ file, mode, onProgress }) {
  const preset = getCompressionPreset(mode)
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

  const compressedBytes = Math.round(file.size * (1 - preset.estimatedReduction))
  return {
    ...buildResult(file.size, compressedBytes, Date.now() - startedAt),
    outputPath: null,
  }
}

async function compressVideoNative({ file, mode, onProgress }) {
  const preset = getCompressionPreset(mode)
  const stamp = Date.now()
  const inputName = `vc-input-${stamp}.mp4`
  const outputName = `vc-output-${stamp}.mp4`
  const startedAt = Date.now()

  onProgress?.(2)

  const base64 = await fileToBase64(file)
  await Filesystem.writeFile({
    path: inputName,
    data: base64,
    directory: Directory.Cache,
  })

  onProgress?.(8)

  const inputUri = await Filesystem.getUri({
    path: inputName,
    directory: Directory.Cache,
  })
  const outputUri = await Filesystem.getUri({
    path: outputName,
    directory: Directory.Cache,
  })

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

      const accepted = await VideoReencoder.reencodeVideo({
        inputPath: inputUri.uri,
        outputPath: outputUri.uri,
        bitrate: preset.bitrate,
      })

      jobId = accepted?.jobId ?? null
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
      ...buildResult(file.size, compressedBytes, Date.now() - startedAt),
      outputPath: result.outputPath,
    }
  } finally {
    if (listenerHandle) {
      await listenerHandle.remove()
    }

    try {
      await Filesystem.deleteFile({ path: inputName, directory: Directory.Cache })
    } catch {
      // Best-effort cleanup of the copied input.
    }
  }
}

/**
 * Compress a picked video.
 * Browser: mock progress + estimated sizes.
 * Android (native): Media3 Transformer via VideoReencoder plugin.
 */
export async function compressVideo(options) {
  if (Capacitor.isNativePlatform()) {
    return compressVideoNative(options)
  }
  return compressVideoMock(options)
}
