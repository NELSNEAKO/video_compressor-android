<script setup>
import { computed, ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import AppHeader from './components/AppHeader.vue'
import VideoSelectCard from './components/VideoSelectCard.vue'
import CompressionModeSelector from './components/CompressionModeSelector.vue'
import ProgressBar from './components/ProgressBar.vue'
import ResultCard from './components/ResultCard.vue'
import PrimaryButton from './components/PrimaryButton.vue'
import { formatBytes } from './utils/formatBytes.js'
import { isPickerCancelled, pickVideo } from './utils/pickVideo.js'
import { compressVideo } from './utils/compressVideo.js'
import { buildSuggestedName, isSaveCancelled, saveCompressedVideo } from './utils/saveVideo.js'

const screen = ref('setup')
const compressionMode = ref('balanced')
const progress = ref(0)
const selectedFile = ref(null)
const result = ref(null)
const isSelecting = ref(false)
const selectError = ref('')
const compressError = ref('')
const saveError = ref('')
const isSaving = ref(false)

const hasFile = computed(() => selectedFile.value !== null)
const canCompress = computed(() => hasFile.value && screen.value === 'setup' && !isCompressing.value)
const isNative = Capacitor.isNativePlatform()
const canSave = computed(() => isNative && Boolean(result.value?.outputPath) && !result.value?.saved)

const isCompressing = ref(false)

async function handleSelectVideo() {
  if (isSelecting.value || isCompressing.value || isSaving.value) return

  isSelecting.value = true
  selectError.value = ''
  compressError.value = ''
  saveError.value = ''

  try {
    const picked = await pickVideo()
    selectedFile.value = picked
    screen.value = 'setup'
    result.value = null
  } catch (error) {
    if (!isPickerCancelled(error)) {
      selectError.value = error?.message || error?.errorMessage || 'Could not open the video picker'
    }
  } finally {
    isSelecting.value = false
  }
}

async function promptSave(currentResult) {
  if (!isNative || !currentResult?.outputPath) {
    return {
      ...currentResult,
      saved: false,
      savedName: '',
      browserOnly: !isNative,
    }
  }

  isSaving.value = true
  saveError.value = ''

  try {
    const saved = await saveCompressedVideo({
      sourcePath: currentResult.outputPath,
      suggestedName: buildSuggestedName(selectedFile.value?.name),
    })

    return {
      ...currentResult,
      saved: true,
      savedName: saved.displayName || '',
      browserOnly: false,
    }
  } catch (error) {
    if (!isSaveCancelled(error)) {
      saveError.value = error?.message || 'Could not save the video'
    }

    return {
      ...currentResult,
      saved: false,
      savedName: '',
      browserOnly: false,
    }
  } finally {
    isSaving.value = false
  }
}

async function handleCompress() {
  if (!hasFile.value || isCompressing.value) return

  screen.value = 'compressing'
  progress.value = 0
  isCompressing.value = true
  compressError.value = ''
  saveError.value = ''
  result.value = null

  try {
    const compressionResult = await compressVideo({
      file: selectedFile.value.file,
      uri: selectedFile.value.uri,
      size: selectedFile.value.size,
      mode: compressionMode.value,
      onProgress: (value) => {
        progress.value = value
      },
    })

    progress.value = 100
    screen.value = 'result'
    result.value = {
      ...compressionResult,
      saved: false,
      savedName: '',
      browserOnly: !isNative,
    }

    result.value = await promptSave(result.value)
  } catch (error) {
    compressError.value = error?.message || error?.errorMessage || 'Compression failed'
    screen.value = 'setup'
    progress.value = 0
  } finally {
    isCompressing.value = false
  }
}

async function handleSave() {
  if (!result.value || isSaving.value) return
  result.value = await promptSave(result.value)
}

function handleCompressAnother() {
  selectedFile.value = null
  compressionMode.value = 'balanced'
  progress.value = 0
  result.value = null
  selectError.value = ''
  compressError.value = ''
  saveError.value = ''
  screen.value = 'setup'
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 px-4 py-8 pb-12">
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <AppHeader subtitle="Compress videos locally on your Android phone" />

      <VideoSelectCard
        :has-file="hasFile"
        :file-name="selectedFile?.name ?? ''"
        :file-size="selectedFile ? formatBytes(selectedFile.size) : ''"
        :loading="isSelecting"
        :error="selectError"
        @select="handleSelectVideo"
      />

      <CompressionModeSelector
        v-model="compressionMode"
        :disabled="screen === 'compressing' || isCompressing || isSaving"
      />

      <ProgressBar
        v-if="screen === 'compressing' || screen === 'result'"
        :progress="progress"
        :label="screen === 'result' ? 'Compression finished' : 'Compressing video locally...'"
      />

      <section
        v-if="screen === 'setup'"
        class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <h2 class="text-lg font-semibold text-white">3. Compress &amp; Save</h2>
        <p class="mt-1 text-sm text-slate-400">
          Compress first, then choose where to save the video on your phone.
        </p>

        <p v-if="compressError" class="mt-3 text-sm text-red-400">{{ compressError }}</p>

        <PrimaryButton
          class="mt-5"
          :label="isCompressing ? 'Compressing...' : 'Compress video'"
          :disabled="!canCompress"
          @click="handleCompress"
        />
      </section>

      <ResultCard
        v-if="screen === 'result' && result"
        :original-size="result.originalSize"
        :compressed-size="result.compressedSize"
        :percent-reduced="result.percentReduced"
        :compression-time="result.compressionTime"
        :saved="result.saved"
        :saved-name="result.savedName"
        :can-save="canSave"
        :saving="isSaving"
        :save-error="saveError"
        :browser-only="result.browserOnly"
        @save="handleSave"
        @compress-another="handleCompressAnother"
      />
    </div>
  </div>
</template>
