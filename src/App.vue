<script setup lang="ts">
import StatusBar from "./components/StatusBar.vue";
import TextBox from "./components/TextBox.vue";
import ActionBar from "./components/ActionBar.vue";
import SpeedControl from "./components/SpeedControl.vue";

import { getZone } from "./core/game-definition.ts";
import { GameEngine } from "./core/game-engine.ts";
import { ref, onMounted, Ref, computed } from "vue";

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

onMounted(() => {
  initializeEngine();
});
</script>

<template>
    <main class="app-shell">
        <section class="app-frame">

            <!-- Top bar for controls -->
            <div class="toolbar">
                <SpeedControl :speed="typewriterSpeed"
                              @increaseSpeed="increaseSpeed"
                              @decreaseSpeed="decreaseSpeed" />
            </div>

            <!-- Middle: Dialogue -->
            <div class="dialogue-card">
                <TextBox :paragraphs="paragraphs"
                         :typewriterSpeed="typewriterSpeed"
                         @typingComplete="onTypingComplete" />
            </div>

            <!-- Bottom: Actions -->
            <div class="actions-row">
                <ActionBar v-if="showActions" :actions="actions" @selected="doAction" />
            </div>

        </section>
    </main>
</template>

<style scoped>
    /* Minimal — layout handled in style.css */
</style>
