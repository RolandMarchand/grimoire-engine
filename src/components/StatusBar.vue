<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentRoom: string;
  totalParagraphs: number;
  isTyping: boolean;
}>();

const roomDisplayName = computed(() => {
  return props.currentRoom
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});

const progressPercentage = computed(() => {
  const maxParagraphs = 100;
  const percentage = Math.min((props.totalParagraphs / maxParagraphs) * 100, 100);
  return Math.round(percentage);
});

const statusMessage = computed(() => {
  if (props.isTyping) {
    return 'Story unfolding...';
  }
  if (props.totalParagraphs === 0) {
    return 'Beginning your journey...';
  }
  if (progressPercentage.value >= 100) {
    return 'Story complete';
  }
  return 'Continue exploring...';
});
</script>

<template>
  <div class="status-bar">
    <div class="status-section location">
      <span class="label">Location:</span>
      <span class="value">{{ roomDisplayName }}</span>
    </div>
    
    <div class="status-section progress">
      <span class="label">Progress:</span>
      <div class="progress-bar-container">
        <div 
          class="progress-bar-fill" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
        <span class="progress-text">{{ progressPercentage }}%</span>
      </div>
    </div>
    
    <div class="status-section messages">
      <span class="label">Paragraphs:</span>
      <span class="value">{{ totalParagraphs }}</span>
    </div>
    
    <div class="status-section status-message">
      <span class="status-indicator" :class="{ typing: isTyping }"></span>
      <span class="value">{{ statusMessage }}</span>
    </div>
  </div>
</template>

<style scoped>
.status-bar {
  background-color: rgba(2, 6, 23, 0.4);
  border-radius: 8px;
  padding: 1em 1em;
  margin-bottom: 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2em;
  font-family: "Crimson Text", serif;
  flex-wrap: wrap;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.label {
  font-weight: 600;
  color: rgba(211, 214, 225, 0.7);
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value {
  font-weight: 400;
  color: rgb(211, 214, 225);
  font-size: 1.1em;
}

.location .value {
  color: rgb(255, 215, 130);
  font-weight: 600;
}

.progress {
  flex: 1;
  min-width: 200px;
}

.progress-bar-container {
  position: relative;
  width: 100%;
  height: 20px;
  background-color: rgba(211, 214, 225, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(100, 150, 255, 0.6) 0%, 
    rgba(150, 200, 255, 0.8) 100%);
  transition: width 0.5s ease;
  border-radius: 10px;
}

.progress-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75em;
  font-weight: 600;
  color: rgb(255, 255, 255);
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  z-index: 1;
}

.status-message {
  font-style: italic;
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(100, 255, 100, 0.5);
  transition: background-color 0.3s ease;
}

.status-indicator.typing {
  background-color: rgba(255, 215, 100, 0.8);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

@media (max-width: 768px) {
  .status-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 1em;
  }
  
  .status-section {
    justify-content: space-between;
  }
  
  .progress {
    width: 100%;
  }
}
</style>