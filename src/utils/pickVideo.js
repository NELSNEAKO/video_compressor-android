import { Capacitor, registerPlugin } from '@capacitor/core'

const VideoReencoder = registerPlugin('VideoReencoder')

/**
 * Opens the system file picker for a single video.
 * Native Android: ACTION_OPEN_DOCUMENT → content:// URI (no file bytes in JS).
 * Browser: HTML file input → { name, size, file }.
 */
export async function pickVideo() {
  if (Capacitor.isNativePlatform()) {
    return pickVideoNative()
  }
  return pickVideoBrowser()
}

async function pickVideoNative() {
  const picked = await VideoReencoder.pickVideo()
  const size = Number(picked?.size) || 0
  const uri = picked?.uri

  if (!uri) {
    throw new Error('No video selected')
  }
  if (size <= 0) {
    throw new Error('Could not read the selected video size. Try another file.')
  }

  return {
    name: picked.name || 'video.mp4',
    size,
    uri,
    file: null,
  }
}

function pickVideoBrowser() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.style.display = 'none'

    let settled = false

    function cleanup() {
      input.removeEventListener('change', onChange)
      window.removeEventListener('focus', onWindowFocus)
      input.remove()
    }

    function settle(fn, value) {
      if (settled) return
      settled = true
      cleanup()
      fn(value)
    }

    function onChange() {
      const file = input.files?.[0]
      if (!file) {
        settle(reject, new Error('No video selected'))
        return
      }

      settle(resolve, {
        name: file.name,
        size: file.size,
        uri: null,
        file,
      })
    }

    // If the user cancels the picker, change never fires.
    // After the window regains focus, check whether a file was chosen.
    function onWindowFocus() {
      setTimeout(() => {
        if (!settled && !input.files?.length) {
          settle(reject, new Error('cancelled'))
        }
      }, 300)
    }

    input.addEventListener('change', onChange)
    window.addEventListener('focus', onWindowFocus)
    document.body.appendChild(input)
    input.click()
  })
}

export function isPickerCancelled(error) {
  return error?.message === 'cancelled' || error?.message === 'No video selected'
}
