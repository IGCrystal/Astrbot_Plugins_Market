<template>
  <div
    class="float-button"
    :class="{ 'float-button--disabled': disabled }"
    role="button"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :tabindex="computedTabIndex"
    :style="buttonStyle"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div class="float-button__inner">
      <n-icon :size="iconSize" class="float-button__icon">
        <slot name="icon" />
      </n-icon>
      <div class="float-button__ripple"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'

type FloatButtonProps = {
  ariaLabel: string
  size?: number | null
  iconSize?: number
  rippleColor?: string
  background?: string
  hoverBackground?: string
  color?: string
  boxShadow?: string
  hoverShadow?: string
  tabIndex?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<FloatButtonProps>(), {
  size: null,
  iconSize: 22,
  rippleColor: 'rgba(255, 255, 255, 0.3)',
  background: 'var(--primary-color)',
  hoverBackground: 'var(--primary-hover)',
  color: '#ffffff',
  boxShadow: 'var(--shadow-md)',
  hoverShadow: 'var(--shadow-lg)',
  tabIndex: 0,
  disabled: false
})

const emit = defineEmits<{ (e: 'click', event: MouseEvent | KeyboardEvent): void }>()

const buttonStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {
    '--float-button-ripple-color': props.rippleColor,
    '--float-button-background': props.background,
    '--float-button-hover-background': props.hoverBackground,
    '--float-button-color': props.color,
    '--float-button-box-shadow': props.boxShadow,
    '--float-button-hover-shadow': props.hoverShadow
  }

  if (props.size !== null && props.size !== undefined) {
    style['--float-button-size'] = `${props.size}px`
  }

  return style
})

const computedTabIndex = computed(() => (props.disabled ? -1 : props.tabIndex))

const handleClick = (event: MouseEvent | KeyboardEvent) => {
  if (props.disabled) {
    event?.preventDefault()
    return
  }
  emit('click', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return
  if (event.code === 'Enter' || event.code === 'Space' || event.key === ' ') {
    event.preventDefault()
    emit('click', event)
  }
}
</script>

<style scoped src="./FloatActionButtonStyles.css"></style>
