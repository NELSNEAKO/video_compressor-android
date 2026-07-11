<script setup>
defineProps({
  subtitle: {
    type: String,
    default: 'Compress on-device. Nothing uploaded.',
  },
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <header :class="compact ? 'pt-1' : 'pt-2'">
    <p
      v-if="!compact"
      class="font-display text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--accent)]"
    >
      On-device
    </p>
    <h1
      class="font-display font-extrabold tracking-tight text-[var(--text)]"
      :class="
        compact
          ? 'mt-0 text-[1.65rem] leading-tight'
          : 'mt-2 text-[2.25rem] leading-[1.08] sm:text-[2.5rem]'
      "
    >
      Video Compressor
    </h1>
    <p
      v-if="!compact"
      class="mt-3 max-w-[19rem] text-[0.95rem] leading-relaxed text-[var(--text-muted)]"
    >
      {{ subtitle }}
    </p>
  </header>
</template>
