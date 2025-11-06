<script setup lang="ts">
import StatusBar from "./components/StatusBar.vue";
import TextBox from "./components/TextBox.vue";
import ActionBar from "./components/ActionBar.vue";
import SpeedControl from "./components/SpeedControl.vue";

import { getZone } from "./core/game-definition.ts";
import type { GameState } from "./core/game-types.ts";
import { GameEngine } from "./core/game-engine.ts";

import { ref, onMounted, Ref, computed } from "vue";
import AnimatedBackground from "./components/AnimatedBackground.vue";

const paragraphs: Ref<Array<string>> = ref([]);
const actions: Ref<Array<string>> = ref([]);
const showActions: Ref<boolean> = ref(false);

const typewriterSpeed: Ref<number> = ref(5);

const gameEngine = new GameEngine();

const gameState = computed(() => gameEngine.gameState);
const inventory = computed(() => gameEngine.gameState.inventory);
const flags = computed(() => gameEngine.gameState.flag);
const currentRoom = computed(() => gameEngine.gameState.currentRoom);
const gameData = computed(() => gameEngine.gameState.data);



const setSpeed = (speed: number) => {
  typewriterSpeed.value = speed;
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
  <main>
   
    
    <AnimatedBackground/>
    <SpeedControl 
      :speed="typewriterSpeed"
      @setSpeed="setSpeed"
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
main {
  margin: 0;
  width: 100%;
  height: 100%;
  padding: 0;

  display: flex;
  flex-direction: column;
}





.flag-item, .data-item {
  display: block;
  margin-left: 10px;
  color: #0f0;
}


</style>