<template>
  <div class="steps-section">
    <div class="custom-steps">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{
          'step-current': currentStep === index + 1,
          'step-finished': currentStep > index + 1
        }"
      >
        <div class="step-indicator">{{ index + 1 }}</div>
        <div class="step-content">
          <div class="step-title">{{ step.title }}</div>
          <div class="step-description">{{ step.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.steps-section {
  padding: 24px 0;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}

.custom-steps {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}

.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  gap: 8px;
  width: 120px;
}

@media (min-width: 426px) {
  .step-item:first-child {
    margin-right: auto;
  }

  .step-item:last-child {
    margin-left: auto;
  }
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  background: var(--bg-base);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.step-content {
  text-align: center;
  min-width: 100px;
  padding: 0 8px;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
  transition: color 0.3s;
}

.step-description {
  font-size: 12px;
  color: var(--text-secondary);
  transition: color 0.3s;
}

.step-current .step-indicator {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
}

.step-current .step-title {
  color: var(--primary-color);
}

.step-current .step-description {
  color: var(--text-secondary);
}

.step-finished .step-indicator {
  background: var(--success-color);
  border-color: var(--success-color);
  color: var(--text-tag);
}

.step-finished .step-title {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .steps-section {
    padding: 16px 0;
  }

  .custom-steps {
    padding: 0 24px;
  }

  .step-content {
    min-width: 80px;
  }

  .step-description {
    display: none;
  }
}

@media (max-width: 425px) {
  .custom-steps {
    justify-content: center;
  }

  .step-item {
    display: none;
    width: auto;
  }

  .step-item.step-current {
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }

  .step-item.step-current .step-indicator {
    flex: 0 0 32px;
  }

  .step-item.step-current .step-content {
    text-align: left;
  }

  .step-item.step-current .step-description {
    display: block;
  }
}
</style>
