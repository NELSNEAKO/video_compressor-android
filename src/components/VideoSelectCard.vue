<script setup>
import PrimaryButton from './PrimaryButton.vue'

defineProps({
  fileName: {
    type: String,
    default: '',
  },
  fileSize: {
    type: String,
    default: '',
  },
  hasFile: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select'])
</script>

<template>
  <section class="animate-fade-up">
    <div class="flex items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-lg font-bold tracking-tight text-[var(--text)]">
          Select video
        </h2>
        <p class="mt-1 text-sm text-[var(--text-muted)]">From gallery or files on this phone.</p>
      </div>
    </div>

    <div
      class="mt-4 rounded-[var(--radius-lg)] border p-5 transition-colors duration-200"
      :class="
        hasFile
          ? 'border-[var(--accent)]/35 bg-[var(--accent-soft)]'
          : 'border-[var(--border)] bg-[var(--surface)]'
      "
    >
      <template v-if="hasFile">
        <div class="flex items-start gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)]/20 text-[var(--accent)]"
            aria-hidden="true"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
              />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">Selected</p>
            <p class="mt-1 truncate text-base font-semibold text-[var(--text)]">{{ fileName }}</p>
            <p class="mt-0.5 text-sm text-[var(--text-muted)]">{{ fileSize }}</p>
          </div>
        </div>
      </template>

      <template v-else>
        <p class="text-base font-medium text-[var(--text)]">No video yet</p>
        <p class="mt-1 text-sm text-[var(--text-faint)]">MP4, MOV, AVI, MKV, and more</p>
      </template>

      <p
        v-if="error"
        class="mt-3 rounded-[var(--radius-sm)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        role="alert"
      >
        {{ error }}
      </p>

      <PrimaryButton
        class="mt-4"
        :label="loading ? 'Opening picker…' : hasFile ? 'Choose another' : 'Select video'"
        variant="secondary"
        :disabled="loading || disabled"
        @click="$emit('select')"
      />
    </div>
  </section>
</template>
