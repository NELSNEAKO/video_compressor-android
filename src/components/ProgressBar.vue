<script setup>
defineProps({
  progress: {
    type: Number,
    default: 0,
  },
  label: {
    type: String,
    default: 'Compressing video...',
  },
})
</script>

<template>
  <section class="animate-fade-up py-6 text-center" aria-live="polite">
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
      {{ label }}
    </p>

    <p
      class="font-display mt-4 text-[4.5rem] font-extrabold leading-none tracking-tight text-[var(--text)] tabular-nums"
    >
      {{ progress }}<span class="text-[2rem] text-[var(--accent)]">%</span>
    </p>

    <div
      class="mx-auto mt-8 h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--surface-raised)]"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label"
    >
      <div
        class="progress-fill h-full rounded-full transition-[width] duration-300 ease-out"
        :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
      />
    </div>

    <p class="mt-4 text-sm text-[var(--text-faint)]">Stays on this device — don’t close the app.</p>
  </section>
</template>
