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
  <section class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-white">3. Compress Video</h2>
        <p class="mt-1 text-sm text-slate-400">{{ label }}</p>
      </div>
      <span class="text-sm font-medium text-sky-400">{{ progress }}%</span>
    </div>

    <div class="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
      <div
        class="h-full rounded-full bg-sky-500 transition-all duration-300"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </section>
</template>
