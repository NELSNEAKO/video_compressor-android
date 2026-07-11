<script setup>
defineProps({
  subtitle: {
    type: String,
    default: 'Compress videos locally on your phone',
  },
})
</script>

<template>
  <header class="text-center">
    <div
      class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-400/20"
    >
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.375 19.5h17.25M5.25 6.75h13.5v10.5H5.25V6.75zM9 10.5v3m6-3v3"
        />
      </svg>
    </div>
    <h1 class="text-3xl font-bold tracking-tight text-white">Video Compressor</h1>
    <p class="mt-2 text-slate-400">{{ subtitle }}</p>
  </header>
</template>
