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
  <section class="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
    <div class="flex items-start gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h2 class="text-lg font-semibold text-white">Compression Complete</h2>
        <p class="mt-1 text-sm text-slate-400">
          <template v-if="saved">Saved as {{ savedName }}</template>
          <template v-else-if="browserOnly">
            Preview only in the browser. On Android you can choose where to save.
          </template>
          <template v-else>Compressed on this device. Choose where to save it.</template>
        </p>
      </div>
    </div>

    <dl class="mt-6 grid gap-4 grid-cols-2">
      <div class="rounded-xl bg-slate-950/60 p-4">
        <dt class="text-sm text-slate-400">Original size</dt>
        <dd class="mt-1 text-lg font-semibold text-white sm:text-xl">{{ originalSize }}</dd>
      </div>
      <div class="rounded-xl bg-slate-950/60 p-4">
        <dt class="text-sm text-slate-400">Compressed size</dt>
        <dd class="mt-1 text-lg font-semibold text-emerald-400 sm:text-xl">{{ compressedSize }}</dd>
      </div>
      <div class="rounded-xl bg-slate-950/60 p-4">
        <dt class="text-sm text-slate-400">Size reduced</dt>
        <dd class="mt-1 text-lg font-semibold text-white sm:text-xl">{{ percentReduced }}%</dd>
      </div>
      <div class="rounded-xl bg-slate-950/60 p-4">
        <dt class="text-sm text-slate-400">Compression time</dt>
        <dd class="mt-1 text-lg font-semibold text-white sm:text-xl">{{ compressionTime }}</dd>
      </div>
    </dl>

    <p v-if="saveError" class="mt-4 text-sm text-red-400">{{ saveError }}</p>

    <div class="mt-6 flex flex-col gap-3">
      <PrimaryButton
        v-if="canSave && !saved"
        :label="saving ? 'Saving...' : 'Save video'"
        :disabled="saving"
        @click="$emit('save')"
      />
      <PrimaryButton
        label="Compress another video"
        variant="secondary"
        :disabled="saving"
        @click="$emit('compress-another')"
      />
    </div>
  </section>
</template>
