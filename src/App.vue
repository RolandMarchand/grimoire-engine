<script setup lang="ts">
import AnimatedBackground from "./components/AnimatedBackground.vue";
import StatusBar from "./components/StatusBar.vue";
import TextBox from "./components/TextBox.vue";
import ActionBar from "./components/ActionBar.vue";
import SpeedControl from "./components/SpeedControl.vue";

import { getZone } from "./core/game-definition.ts";
import type { GameState } from "./core/game-types.ts";
import { GameEngine } from "./core/game-engine.ts";

import { ref, onMounted, Ref, computed } from "vue";
import { watchEffect } from "vue";

const paragraphs: Ref<Array<string>> = ref([]);
const actions: Ref<Array<string>> = ref([]);
const showActions: Ref<boolean> = ref(false);

const typewriterSpeed: Ref<number> = ref(10);

const gameEngine = new GameEngine();

const gameState = computed(() => gameEngine.gameState);
const inventory = computed(() => gameEngine.gameState.inventory);
const flags = computed(() => gameEngine.gameState.flag);
const currentRoom = computed(() => gameEngine.gameState.currentRoom);
const gameData = computed(() => gameEngine.gameState.data);



const increaseSpeed = () => {
  if (typewriterSpeed.value > 0) {
    typewriterSpeed.value = Math.max(0, typewriterSpeed.value - 5);
  }
};

const decreaseSpeed = () => {
  if (typewriterSpeed.value < 100) {
    typewriterSpeed.value = Math.min(100, typewriterSpeed.value + 5);
  }
};

const initializeEngine = async () => {
  try {
    const zone = await getZone();

    if (!zone) {
      paragraphs.value.push("Error: Zone data is unavailable.");
      return;
    }


    const result = await gameEngine.initializeGame(zone);
    

    paragraphs.value.push(...result.messages);
    actions.value = result.actions;
    
  } catch (e) {
    console.error("Error initializing engine:", e);
    paragraphs.value.push("Error loading game.");
  }
};

/* Dynamic Theme System */
const currentTheme = ref("themedefault.css");

const loadTheme = (themeFile: string) => {
  const existing = document.getElementById("active-theme") as HTMLLinkElement | null;
  const themeUrl = `/themes/${themeFile}?v=${Date.now()}`;
  if (existing) {
    existing.href = themeUrl;
  } else {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.id = "active-theme";
    link.href = themeUrl;
    document.head.appendChild(link);
  }
};

onMounted(() => {
  loadTheme(currentTheme.value);
});

const switchTheme = (themeName: string) => {
  currentTheme.value = themeName;
  loadTheme(themeName);
};

const doAction = async (action: string): Promise<void> => {
  try {
    showActions.value = false;
    

    const result = await gameEngine.executeAction(action);
    

    paragraphs.value.push(...result.messages);
    
  
    actions.value = result.actions;
    

    
  } catch (e) {
    console.error("Error executing action:", e);
    paragraphs.value.push("Error processing action.");
  }
};

const onTypingComplete = () => {
  showActions.value = true;
};

const formatItemName = (item: string) => {
  return item
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

onMounted(() => {
  initializeEngine();
});
</script>

<template>
<button
  class="theme-toggle"
  @click="switchTheme(currentTheme === 'themedefault.css' ? 'themenight.css' : 'themedefault.css')">
  Switch Theme
</button>    
  <main>
    <!-- Animated background covering the entire screen -->
    <AnimatedBackground />
    
    <SpeedControl 
      :speed="typewriterSpeed"
      @increaseSpeed="increaseSpeed"
      @decreaseSpeed="decreaseSpeed"
    />
    <TextBox 
      :paragraphs="paragraphs" 
      :typewriterSpeed="typewriterSpeed"
      @typingComplete="onTypingComplete"
    />
    <ActionBar v-if="showActions" :actions="actions" @selected="doAction" />
  </main>
</template>

<style scoped>
/* Main page container */
main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  min-height: 100vh;
  width: 100%;
  padding: 2vh 0;
}

/* Theme toggle button */
.theme-toggle {
  position: fixed;
  top: var(--theme-toggle-top);
  left: var(--theme-toggle-left);
  z-index: var(--z-index-theme-toggle);
  font-family: var(--font-main);
  font-weight: var(--font-weight-main);
  font-size: var(--font-size-theme-toggle);
  color: var(--color-text);
  background: var(--bg-theme-toggle);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  padding: var(--padding-small);
  cursor: pointer;
  backdrop-filter: blur(1px);
  transition: background-color var(--transition-normal) ease, color var(--transition-normal) ease;
}

.theme-toggle:hover {
  background-color: var(--bg-theme-toggle-hover);
  color: var(--color-accent);
}

/* Debug area (preserved) */
.flag-item, .data-item {
  display: block;
  margin-left: 10px;
  color: var(--text-debug);
}
</style>


