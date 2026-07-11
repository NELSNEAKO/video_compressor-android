<script setup>
const modes = [
  {
    id: 'fast',
    title: 'Fast',
    description: 'Same resolution, lighter compression, larger file.',
    badge: 'Speed',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'Same resolution, good balance of quality and size.',
    badge: 'Recommended',
  },
  {
    id: 'maximum',
    title: 'Maximum Compression',
    description: 'Same resolution, smallest file, lower quality.',
    badge: 'Smallest',
  },
]

defineProps({
  modelValue: {
    type: String,
    default: 'balanced',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <section class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
    <h2 class="text-lg font-semibold text-white">2. Compression Mode</h2>
    <p class="mt-1 text-sm text-slate-400">Pick how you want to balance speed and quality.</p>

    <div class="mt-5 grid gap-3">
      <button
        v-for="mode in modes"
        :key="mode.id"
        type="button"
        class="rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        :class="
          modelValue === mode.id
            ? 'border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30'
            : 'border-slate-700 bg-slate-950/50 hover:border-slate-600 hover:bg-slate-900'
        "
        :disabled="disabled"
        @click="$emit('update:modelValue', mode.id)"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-semibold text-white">{{ mode.title }}</span>
          <span class="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
            {{ mode.badge }}
          </span>
        </div>
        <p class="mt-2 text-sm text-slate-400">{{ mode.description }}</p>
      </button>
    </div>
  </section>
</template>
