export function formatBytes(bytes) {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / 1024 ** index

  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}
