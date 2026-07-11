/** Compression mode → bitrate only (keeps original resolution). */
export const COMPRESSION_PRESETS = {
  fast: {
    bitrate: 3_500_000,
    estimatedReduction: 0.25,
  },
  balanced: {
    bitrate: 1_800_000,
    estimatedReduction: 0.45,
  },
  maximum: {
    bitrate: 900_000,
    estimatedReduction: 0.65,
  },
}

export function getCompressionPreset(mode) {
  return COMPRESSION_PRESETS[mode] ?? COMPRESSION_PRESETS.balanced
}
