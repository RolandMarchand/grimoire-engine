<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  speed: number;
  minSpeed?: number;
  maxSpeed?: number;
}>();

const emit = defineEmits<{
  setSpeed: [speed: number];
}>();

const minSpeed = props.minSpeed ?? 0;
const maxSpeed = props.maxSpeed ?? 100;

const speedPercentage = computed(() => {
  const range = maxSpeed - minSpeed;
  const normalized = maxSpeed - props.speed;
  return Math.round((normalized / range) * 100);
});

const handleSliderChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const percentage = parseInt(target.value);
  const range = maxSpeed - minSpeed;
  const newSpeed = maxSpeed - Math.round((percentage / 100) * range);
  emit('setSpeed', newSpeed);
};
</script>

<template>
  <div class="speed">
    <div class="speed-controls">
      <label class="speed-label">Speed</label>
      <input 
        type="range" 
        :value="speedPercentage"
        @input="handleSliderChange"
        min="0"
        max="100"
        class="speed-slider"
        aria-label="Adjust typing speed"
      />
      <div class="speed-display">
        <span class="speed-text">{{ speedPercentage }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.speed {
  position: absolute;
  top: 1em;
  right: 1em;
}

.speed-controls {
  display: flex;
  align-items: center;
  gap: 1em;
  padding: 0 1em;
}

.speed-label {
  font-family: "Crimson Text", serif;
  font-weight: 400;
  font-size: 1.2em;
  color: rgb(211, 214, 225);
}

.speed-slider {
  width: 150px;
  height: 6px;
  border-radius: 3px;
  background: rgba(211, 214, 225, 0.2);
  outline: none;
  cursor: pointer;
  appearance: none;
}

.speed-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgb(211, 214, 225);
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid rgb(211, 214, 225);
}

.speed-slider::-webkit-slider-thumb:hover {
  background: rgb(255, 255, 255);
  border-color: rgb(255, 255, 255);
  box-shadow: 0 0 8px rgba(66, 180, 251, 0.6);
  transform: scale(1.15);
}

.speed-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgb(211, 214, 225);
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid rgb(211, 214, 225);
}

.speed-slider::-moz-range-thumb:hover {
  background: rgb(255, 255, 255);
  border-color: rgb(255, 255, 255);
  box-shadow: 0 0 8px rgba(66, 180, 251, 0.6);
  transform: scale(1.15);
}

.speed-display {
  font-family: "Crimson Text", serif;
  font-weight: 400;
  font-size: 1.2em;
  color: rgb(211, 214, 225);
  min-width: 3.5em;
  text-align: center;
  padding: 0.25em 0.5em;
  border-radius: 4px;
}

.speed-text {
  user-select: none;
}
</style>