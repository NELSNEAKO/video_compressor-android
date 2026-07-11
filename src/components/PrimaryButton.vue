<script setup>
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
    class="inline-flex w-full min-h-[var(--tap)] items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-[0.95rem] font-semibold tracking-tight transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)] disabled:cursor-not-allowed disabled:opacity-45"
    :class="{
      'bg-[var(--accent)] text-[#1a1205] hover:bg-[var(--accent-hover)] active:scale-[0.98]':
        variant === 'primary',
      'border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface)] active:scale-[0.98]':
        variant === 'secondary',
      'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]':
        variant === 'ghost',
    }"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot>{{ label }}</slot>
  </button>
</template>
