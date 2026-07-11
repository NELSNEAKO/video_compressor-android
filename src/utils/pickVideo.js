/**
 * Opens the system file picker for a single video.
 * Works in the browser and in Capacitor Android WebView.
 * Returns { name, size, file } or throws if the user cancels / no file.
 */
export function pickVideo() {
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
