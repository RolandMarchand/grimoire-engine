<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  speed: number;
  minSpeed?: number;
  maxSpeed?: number;
}>();

const emit = defineEmits<{
  increaseSpeed: [];
  decreaseSpeed: [];
}>();

const minSpeed = props.minSpeed ?? 0;
const maxSpeed = props.maxSpeed ?? 100;

const speedLabel = computed(() => {
  return props.speed === 0 ? "Instant" : `${props.speed}ms`;
});

const isAtMinSpeed = computed(() => props.speed <= minSpeed);
const isAtMaxSpeed = computed(() => props.speed >= maxSpeed);

const handleIncrease = () => {
  if (!isAtMinSpeed.value) emit("increaseSpeed");
};

const handleDecrease = () => {
  if (!isAtMaxSpeed.value) emit("decreaseSpeed");
};
</script>

<template>
  <div class="speed-controls">
    <button
      @click="handleIncrease"
      :disabled="isAtMinSpeed"
      class="speed-btn"
      aria-label="Increase typing speed"
    >
      +
    </button>
    <span class="speed-display">Speed: {{ speedLabel }}</span>
    <button
      @click="handleDecrease"
      :disabled="isAtMaxSpeed"
      class="speed-btn"
      aria-label="Decrease typing speed"
    >
      -
    </button>
  </div>
</template>

<style scoped>
/* Fixed at top right corner, occupies small area */
.speed-controls {
  position: absolute;
  top: var(--speed-control-top);
  right: var(--speed-control-right);
  display: flex;
  align-items: center;
  gap: var(--gap-small);
  background: transparent;
  padding: 0;
  box-shadow: none;
  border: none;
  z-index: var(--z-index-speed-control);
  transform: scale(var(--speed-control-scale));
}

/* Small transparent circular button */
.speed-btn {
  font-family: var(--font-main);
  font-weight: var(--font-weight-speed-btn);
  font-size: var(--font-size-speed-btn);
  width: var(--speed-btn-size);
  height: var(--speed-btn-size);
  border-radius: 50%;

  background: transparent;
  border: var(--border-width-thin) solid var(--bg-speed-btn-border);
  color: var(--color-text);
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.25s ease;
  backdrop-filter: blur(1px);
}

/* Soft glow on hover, readable on any background */
.speed-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
  box-shadow: var(--shadow-speed-btn-hover);
  transform: scale(var(--speed-btn-hover-scale));
}

/* Slight scale down feedback on click */
.speed-btn:active:not(:disabled) {
  transform: scale(var(--speed-btn-active-scale));
  box-shadow: none;
}

/* Disabled state: Reduce opacity */
.speed-btn:disabled {
  opacity: var(--speed-btn-disabled-opacity);
  cursor: not-allowed;
}

/* Speed number display */
.speed-display {
  font-family: var(--font-story);
  font-weight: var(--font-weight-main);
  font-size: var(--font-size-speed-display);
  color: var(--color-text);
  user-select: none;
}
</style>
