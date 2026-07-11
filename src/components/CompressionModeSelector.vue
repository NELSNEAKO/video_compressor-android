<script setup>
const modes = [
  {
    id: 'fast',
    title: 'Fast',
    description: 'Lighter compression, larger file.',
    badge: 'Speed',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'Good quality and size trade-off.',
    badge: 'Best for most',
  },
  {
    id: 'maximum',
    title: 'Maximum',
    description: 'Smallest file, lower quality.',
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
  <section class="animate-fade-up" style="animation-delay: 60ms">
    <h2 class="font-display text-lg font-bold tracking-tight text-[var(--text)]">
      Compression mode
    </h2>
    <p class="mt-1 text-sm text-[var(--text-muted)]">Same resolution — pick speed vs size.</p>

    <div class="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Compression mode">
      <button
        v-for="mode in modes"
        :key="mode.id"
        type="button"
        role="radio"
        :aria-checked="modelValue === mode.id"
        class="group flex min-h-[var(--tap)] items-center gap-3 rounded-[var(--radius-md)] border px-3.5 py-3 text-left transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:opacity-50"
        :class="
          modelValue === mode.id
            ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
            : 'border-[var(--border)] bg-transparent hover:border-[var(--border-strong)] hover:bg-[var(--surface)]'
        "
        :disabled="disabled"
        @click="$emit('update:modelValue', mode.id)"
      >
        <span
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition duration-200"
          :class="
            modelValue === mode.id
              ? 'border-[var(--accent)]'
              : 'border-[var(--border-strong)] group-hover:border-[var(--text-faint)]'
          "
          aria-hidden="true"
        >
          <span
            class="h-2.5 w-2.5 rounded-full bg-[var(--accent)] transition duration-200"
            :class="modelValue === mode.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
          />
        </span>

        <span class="min-w-0 flex-1">
          <span class="flex items-baseline justify-between gap-2">
            <span class="font-semibold text-[var(--text)]">{{ mode.title }}</span>
            <span
              class="text-[0.7rem] font-medium uppercase tracking-wide"
              :class="
                modelValue === mode.id ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]'
              "
            >
              {{ mode.badge }}
            </span>
          </span>
          <span class="mt-0.5 block text-sm text-[var(--text-muted)]">{{ mode.description }}</span>
        </span>
      </button>
    </div>
  </section>
</template>
