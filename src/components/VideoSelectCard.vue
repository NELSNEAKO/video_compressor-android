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
})

defineEmits(['select'])
</script>

<template>
  <section class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
    <h2 class="text-lg font-semibold text-white">1. Select Video</h2>
    <p class="mt-1 text-sm text-slate-400">Choose a video from your phone gallery or files.</p>

    <div
      class="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-6 text-center"
    >
      <template v-if="hasFile">
        <p class="text-sm font-medium text-slate-300">Selected file</p>
        <p class="mt-2 truncate text-base font-semibold text-white">{{ fileName }}</p>
        <p class="mt-1 text-sm text-slate-400">{{ fileSize }}</p>
      </template>

      <template v-else>
        <p class="text-sm text-slate-400">No video selected yet</p>
        <p class="mt-1 text-xs text-slate-500">MP4, MOV, AVI, MKV, and more</p>
      </template>

      <p v-if="error" class="mt-3 text-sm text-red-400">{{ error }}</p>

      <PrimaryButton
        class="mt-4"
        :label="loading ? 'Opening file picker...' : hasFile ? 'Choose another video' : 'Select video'"
        variant="secondary"
        :disabled="loading"
        @click="$emit('select')"
      />
    </div>
  </section>
</template>
