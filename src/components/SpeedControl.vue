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
  return props.speed === 0 ? 'Instant' : `${props.speed}ms`;
});

const isAtMinSpeed = computed(() => props.speed <= minSpeed);
const isAtMaxSpeed = computed(() => props.speed >= maxSpeed);

const handleIncrease = () => {
  if (!isAtMinSpeed.value) {
    emit('increaseSpeed');
  }
};

const handleDecrease = () => {
  if (!isAtMaxSpeed.value) {
    emit('decreaseSpeed');
  }
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
.speed-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1em;
  padding: 1em 2em;
  background-color: rgba(2, 6, 23, 0.3);
}

.speed-btn {
  font-family: "Crimson Text", serif;
  font-weight: 700;
  font-size: 1.5em;
  width: 2.5em;
  height: 2.5em;
  background-color: rgba(211, 214, 225, 0.1);
  color: rgb(211, 214, 225);
  border: 2px solid rgb(211, 214, 225);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.speed-btn:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
  color: rgb(255, 255, 255);
  border-color: rgb(255, 255, 255);
  transform: scale(1.1);
}

.speed-btn:active:not(:disabled) {
  transform: scale(0.95);
  background-color: rgba(159, 163, 179, 0.3);
}

.speed-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.speed-display {
  font-family: "Crimson Text", serif;
  font-weight: 400;
  font-size: 1.2em;
  color: rgb(211, 214, 225);
  min-width: 8em;
  text-align: center;
}
</style>