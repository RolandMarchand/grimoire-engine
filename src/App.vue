<script setup lang="ts">
import StatusBar from "./components/StatusBar.vue";
import TextBox from "./components/TextBox.vue";
import ActionBar from "./components/ActionBar.vue";
import SpeedControl from "./components/SpeedControl.vue";

import { getZone } from "./core/game-definition.ts";
import type { GameState } from "./core/game-definition.ts";
import { EventProcessor } from "./core/event-processor.ts";
import { RoomNavigator } from "./core/room-navigator.ts";

import { ref, onMounted, Ref } from "vue";

const paragraphs: Ref<Array<string>> = ref([]);
const actions: Ref<Array<string>> = ref([]);
const showActions: Ref<boolean> = ref(false);
const isTyping: Ref<boolean> = ref(false);

const typewriterSpeed: Ref<number> = ref(5);

const gameState: Ref<GameState> = ref({
  currentRoom: "",
  flag: {},
  inventory: [],
  data: {}
});

let zoneData: any = null;
let eventProcessor: EventProcessor | null = null;
let roomNavigator: RoomNavigator | null = null;

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

    zoneData = zone;

    eventProcessor = new EventProcessor(zoneData);
    roomNavigator = new RoomNavigator(gameState.value, zoneData, eventProcessor);

    await loadRoom(zone.spawn);
    
  } catch (e) {
    console.error("Error initializing engine:", e);
    paragraphs.value.push("Error loading game.");
  }
};

const loadRoom = async (roomName?: string) => {
  if (!roomNavigator) {
    console.error("RoomNavigator not initialized");
    return;
  }

  try {
    const targetRoom = roomName || gameState.value.currentRoom;
    
    if (!targetRoom) {
      paragraphs.value.push("Error: No room specified.");
      return;
    }

    showActions.value = false;
    const result = await roomNavigator.navigateToRoom(targetRoom);
    
    paragraphs.value.push(...result.messages);
    
    actions.value = result.actions;
    
  } catch (e) {
    console.error("Error loading room:", e);
    paragraphs.value.push("Error navigating to room.");
  }
};

const doAction = async (action: string): Promise<void> => {
  if (!roomNavigator) {
    console.error("RoomNavigator not initialized");
    paragraphs.value.push("Error: Game engine not ready.");
    return;
  }

  try {
    showActions.value = false;
    const result = await roomNavigator.executeAction(action);
    
    paragraphs.value.push(...result.messages);
    
    actions.value = result.actions;
    
  } catch (e) {
    console.error("Error executing action:", e);
    paragraphs.value.push("Error processing action.");
  }
};

const onTypingComplete = () => {
  showActions.value = true;
  isTyping.value = false;
};

const onTypingStart = () => {
  isTyping.value = true;
};

onMounted(() => {
  initializeEngine();
});
</script>

<template>
  <main>
    <SpeedControl 
      :speed="typewriterSpeed"
      @increaseSpeed="increaseSpeed"
      @decreaseSpeed="decreaseSpeed"
    />
    <div class="content">
      <StatusBar 
        :currentRoom="gameState.currentRoom"
        :totalParagraphs="paragraphs.length"
        :isTyping="isTyping"
      />
      <TextBox 
        :paragraphs="paragraphs" 
        :typewriterSpeed="typewriterSpeed"
        @typingComplete="onTypingComplete"
        @typingStart="onTypingStart"
      />
        <ActionBar v-if="showActions" :actions="actions" @selected="doAction" />
    </div>
  </main>
</template>

<style scoped>
.content{
  position: absolute;
  left: 10%;
  right: 10%;
  top: 8%;
}
</style>