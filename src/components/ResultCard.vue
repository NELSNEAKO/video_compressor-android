<script setup>
import PrimaryButton from './PrimaryButton.vue'

defineProps({
  originalSize: {
    type: String,
    required: true,
  },
  compressedSize: {
    type: String,
    required: true,
  },
  percentReduced: {
    type: Number,
    required: true,
  },
  compressionTime: {
    type: String,
    required: true,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  savedName: {
    type: String,
    default: '',
  },
  canSave: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  saveError: {
    type: String,
    default: '',
  },
  browserOnly: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['compress-another', 'save'])
</script>

<template>
  <section class="animate-result-in">
    <div class="flex items-start gap-3">
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]"
        aria-hidden="true"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.25">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div class="min-w-0">
        <h2 class="font-display text-xl font-bold tracking-tight text-[var(--text)]">
          Ready
        </h2>
        <p class="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
          <template v-if="saved">Saved as {{ savedName }}</template>
          <template v-else-if="browserOnly">
            Preview in browser. On Android you can choose where to save.
          </template>
          <template v-else>Compressed on this device. Save it when you’re ready.</template>
        </p>
      </div>
    </div>

    <div class="mt-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-5 py-6 text-center">
      <p class="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-faint)]">
        Size reduced
      </p>
      <p class="font-display mt-2 text-[3.25rem] font-extrabold leading-none tracking-tight text-[var(--accent)] tabular-nums">
        {{ percentReduced }}%
      </p>
      <p class="mt-3 text-sm text-[var(--text-muted)]">
        <span class="text-[var(--text-faint)]">{{ originalSize }}</span>
        <span class="mx-2 text-[var(--text-faint)]">→</span>
        <span class="font-semibold text-[var(--success)]">{{ compressedSize }}</span>
      </p>
      <p class="mt-2 text-sm text-[var(--text-faint)]">Took {{ compressionTime }}</p>
    </div>

    <p
      v-if="saveError"
      class="mt-4 rounded-[var(--radius-sm)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
      role="alert"
    >
      {{ saveError }}
    </p>

    <div class="mt-6 flex flex-col gap-3">
      <PrimaryButton
        v-if="canSave && !saved"
        :label="saving ? 'Saving…' : 'Save video'"
        :disabled="saving"
        @click="$emit('save')"
      />
      <PrimaryButton
        label="Compress another"
        variant="secondary"
        :disabled="saving"
        @click="$emit('compress-another')"
      />
    </div>
  </section>
</template>
