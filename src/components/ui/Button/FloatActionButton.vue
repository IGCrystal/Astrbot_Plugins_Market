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

<script setup>
import { computed } from 'vue'
import { NIcon } from 'naive-ui'

const props = defineProps({
  ariaLabel: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: null
  },
  iconSize: {
    type: Number,
    default: 22
  },
  rippleColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.3)'
  },
  background: {
    type: String,
    default: 'var(--primary-color)'
  },
  hoverBackground: {
    type: String,
    default: 'var(--primary-hover)'
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  boxShadow: {
    type: String,
    default: 'var(--shadow-md)'
  },
  hoverShadow: {
    type: String,
    default: 'var(--shadow-lg)'
  },
  tabIndex: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonStyle = computed(() => {
  const style = {
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

const handleClick = (event) => {
  if (props.disabled) {
    event?.preventDefault()
    return
  }
  emit('click', event)
}

const handleKeydown = (event) => {
  if (props.disabled) return
  if (event.code === 'Enter' || event.code === 'Space' || event.key === ' ') {
    event.preventDefault()
    emit('click', event)
  }
}
</script>

<style scoped src="./FloatActionButtonStyles.css"></style>
