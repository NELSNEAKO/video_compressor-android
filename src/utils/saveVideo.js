import { Capacitor, registerPlugin } from '@capacitor/core'

const VideoReencoder = registerPlugin('VideoReencoder')

export function isSaveCancelled(error) {
  return error?.message === 'cancelled'
}

export function buildSuggestedName(originalName = 'video') {
  const base = String(originalName)
    .replace(/\.[^/.]+$/, '')
    .replace(/[^\w\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${base || 'video'}-compressed.mp4`
}

/**
 * Opens Android Save as, then copies the compressed cache file there.
 * Browser: no-op save (preview only).
 */
export async function saveCompressedVideo({ sourcePath, suggestedName }) {
  if (!Capacitor.isNativePlatform()) {
    return {
      saved: false,
      displayName: null,
      browserOnly: true,
    }
  }

  if (!sourcePath) {
    throw new Error('No compressed video available to save')
  }

  const location = await VideoReencoder.pickSaveLocation({
    suggestedName: suggestedName || 'compressed-video.mp4',
  })

  const copied = await VideoReencoder.copyFileToUri({
    sourcePath,
    destinationUri: location.uri,
  })

  return {
    saved: true,
    displayName: copied.displayName || location.displayName || suggestedName,
    uri: copied.uri || location.uri,
    browserOnly: false,
  }
}
