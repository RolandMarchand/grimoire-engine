<script setup lang="ts">
import TextBox from "./components/TextBox.vue";
import ActionBar from "./components/ActionBar.vue";
import SpeedControl from "./components/SpeedControl.vue";
import AnimatedBackground from "./components/AnimatedBackground.vue";

import { getZone } from "./core/game-definition.ts";
import { GameEngine } from "./core/game-engine.ts";
import type { DialogueState } from "./core/game-types.ts";
import type { SaveData } from "./core/save-manager.ts";

import { ref, onMounted, Ref, computed } from "vue";

const paragraphs: Ref<Array<string>> = ref([]);
const actions: Ref<Array<string>> = ref([]);
const showActions: Ref<boolean> = ref(false);
const dialogueState: Ref<DialogueState> = ref({ active: false });

const typewriterSpeed: Ref<number> = ref(10);
const speedControlRef = ref<any>(null);

const gameEngine = new GameEngine();

// Create a non-readonly version of gameState for the save system
const gameState = computed(() => {
  const state = gameEngine.gameState;
  return {
    currentRoom: state.currentRoom,
    inventory: [...state.inventory],
    flag: { ...state.flag },
    data: { ...state.data }
  };
});

const currentRoomName = computed(() => {
  const room = gameEngine.getCurrentRoomData();
  return room?.shortDescription || gameEngine.getCurrentRoom();
});

const parseBBCode = (text: string): string => {
  return text
    .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>')           // Italic
    .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')   // Bold
    .replace(/\[color=(#?\w+)\](.*?)\[\/color\]/g, '<span style="color:$1">$2</span>') // Color
    .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')             // Underline
    .replace(/\[s\](.*?)\[\/s\]/g, '<s>$1</s>');            // Strikethrough
};

const setSpeed = (speed: number) => {
  typewriterSpeed.value = speed;
};

// Auto-save trigger - call this after state changes
const triggerAutoSave = async () => {
  // Don't auto-save during dialogue
  if (dialogueState.value.active) {
    return;
  }
  
  
  if (speedControlRef.value?.autoSave) {
    await speedControlRef.value.autoSave();
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

    if (result.startDialogue) {
      await handleDialogueStart(result.startDialogue);
    }
    
  } catch (e) {
    console.error("Error initializing engine:", e);
    paragraphs.value.push("Error loading game.");
  }
};

const handleDialogueStart = async (dialogueRef: string) => {
  const newState = await gameEngine.startDialogue(dialogueRef);
  dialogueState.value = newState;
  
  if (newState.active && newState.text) {
      
    const cleanText = parseBBCode(newState.text);
    const speakerText = newState.speaker 
      ? `${newState.speaker.name}: ${cleanText}`
      : cleanText;
    paragraphs.value.push(speakerText);
    

    if (newState.choices && newState.choices.length > 0) {
      actions.value = newState.choices.map(c => c.text);
    } else if (newState.currentNode) {
 
      await handleDialogueContinue();
    } else {
     
      dialogueState.value = { active: false };
      actions.value = gameEngine.getAvailableActions();
    }
  }
  
  triggerAutoSave();
};

const doAction = async (action: string): Promise<void> => {
  try {
    showActions.value = false;
    
    
    if (dialogueState.value.active) {
      await handleDialogueChoice(action);
      return;
    }

    
    const result = await gameEngine.executeAction(action);

    paragraphs.value.push(...result.messages);
    actions.value = result.actions;

    if (result.startDialogue) {
      await handleDialogueStart(result.startDialogue);
    }
    
    triggerAutoSave();
    
  } catch (e) {
    console.error("Error executing action:", e);
    paragraphs.value.push("Error processing action.");
  }
};

const handleDialogueContinue = async () => {
  const newState = await gameEngine.continueDialogue();
  dialogueState.value = newState;
  
  if (!newState.active) {
    actions.value = gameEngine.getAvailableActions();
    triggerAutoSave();
    return;
  }
  
  if (newState.text) {
    const cleanText = parseBBCode(newState.text);
    const speakerText = newState.speaker 
      ? `${newState.speaker.name}: ${cleanText}`
      : cleanText;
    paragraphs.value.push(speakerText);
    
    if (newState.choices && newState.choices.length > 0) {
      actions.value = newState.choices.map(c => c.text);
    } else if (newState.currentNode) {
      await handleDialogueContinue();
    } else {
      dialogueState.value = { active: false };
      actions.value = gameEngine.getAvailableActions();
    }
  }
  
  triggerAutoSave();
};

const handleDialogueChoice = async (choiceText: string) => {
  const choiceIndex = dialogueState.value.choices?.findIndex(c => c.text === choiceText);
  if (choiceIndex === undefined || choiceIndex === -1) return;
  
  const newState = await gameEngine.selectDialogueChoice(choiceIndex);
  dialogueState.value = newState;
  
  if (!newState.active) {
    actions.value = gameEngine.getAvailableActions();
    triggerAutoSave();
    return;
  }
  
  if (newState.text) {
    const cleanText = parseBBCode(newState.text);
    const speakerText = newState.speaker 
      ? `${newState.speaker.name}: ${cleanText}`
      : cleanText;
    paragraphs.value.push(speakerText);
    
    if (newState.choices && newState.choices.length > 0) {
      actions.value = newState.choices.map(c => c.text);
    } else if (newState.currentNode) {
      await handleDialogueContinue();
    } else {
      dialogueState.value = { active: false };
      actions.value = gameEngine.getAvailableActions();
    }
  }
  
  triggerAutoSave();
};

const handleLoad = async (saveData: SaveData) => {
  
  paragraphs.value = [...saveData.gameState.messageHistory];
  
 
  const engine = gameEngine as any; 
  
 
  engine._gameState.currentRoom = saveData.gameState.currentRoom;
  engine._gameState.inventory = [...saveData.gameState.inventory];
  engine._gameState.flag = { ...saveData.gameState.flag };
  engine._gameState.data = { ...saveData.gameState.data };
  
 
  dialogueState.value = { active: false };
  

  actions.value = gameEngine.getAvailableActions();
  
  console.log('Game loaded successfully');
};

const handleSaved = () => {
  console.log('Game saved!');
};

const onTypingComplete = () => {
  showActions.value = true;
};

onMounted(() => {
  initializeEngine();
});
</script>

<template>
  <main>
    <AnimatedBackground/>
    <SpeedControl 
      ref="speedControlRef"
      :speed="typewriterSpeed"
      :game-state="gameState"
      :current-room-name="currentRoomName"
      :paragraphs="paragraphs"
      :dialogue-active="dialogueState.active"
      @setSpeed="setSpeed"
      @load="handleLoad"
      @saved="handleSaved"
    />
    <TextBox 
      :paragraphs="paragraphs" 
      :typewriterSpeed="typewriterSpeed"
      @typingComplete="onTypingComplete"
    />
    <ActionBar 
      v-if="showActions" 
      :actions="actions" 
      @selected="doAction" 
    />
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