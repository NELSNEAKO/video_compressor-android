<script setup>
import PrimaryButton from './PrimaryButton.vue'

defineProps({
  label: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost'].includes(value),
  },
})

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    :class="{
      'bg-sky-500 text-white hover:bg-sky-400': variant === 'primary',
      'border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700': variant === 'secondary',
      'text-slate-300 hover:bg-slate-800 hover:text-white': variant === 'ghost',
    }"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot>{{ label }}</slot>
  </button>
</template>
