<script setup lang="ts">
import AnimatedBackground from "./components/AnimatedBackground.vue";
import StatusBar from "./components/StatusBar.vue";
import TextBox from "./components/TextBox.vue";
import ActionBar from "./components/ActionBar.vue";
import SpeedControl from "./components/SpeedControl.vue";

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
    .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>')
    .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
    .replace(/\[color=(#?\w+)\](.*?)\[\/color\]/g, '<span style="color:$1">$2</span>')
    .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
    .replace(/\[s\](.*?)\[\/s\]/g, '<s>$1</s>');
};

const setSpeed = (speed: number) => {
  typewriterSpeed.value = speed;
};

const triggerAutoSave = async () => {
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

/* Dynamic Theme System with localStorage persistence */
const THEME_STORAGE_KEY = 'grimoire-engine-theme';
const currentTheme = ref("themedefault.css");
const isDarkTheme = computed(() => currentTheme.value === 'themenight.css');

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
  
  // Save to localStorage
  localStorage.setItem(THEME_STORAGE_KEY, themeFile);
};

const switchTheme = () => {
  const newTheme = currentTheme.value === 'themedefault.css' ? 'themenight.css' : 'themedefault.css';
  currentTheme.value = newTheme;
  loadTheme(newTheme);
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
  // Load saved theme from localStorage or use default
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme && (savedTheme === 'themedefault.css' || savedTheme === 'themenight.css')) {
    currentTheme.value = savedTheme;
  }
  loadTheme(currentTheme.value);
  
  initializeEngine();
});
</script>

<template>
 <main class="app-shell">
  <button
    class="theme-toggle"
    @click="switchTheme"
    :title="isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
  >
    {{ isDarkTheme ? '☀️' : '🌙' }}
  </button>  
   <AnimatedBackground/>
    <section class="app-frame" :class="{ 'dark-theme': isDarkTheme }">
      <div class="toolbar">
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
      </div>
      <div class="dialogue-card">
        <TextBox 
          :paragraphs="paragraphs" 
          :typewriterSpeed="typewriterSpeed"
          @typingComplete="onTypingComplete"
        />
      </div>
      <div class="actions-row">
      <ActionBar 
        v-if="showActions" 
        :actions="actions" 
        @selected="doAction" 
      />
      </div>
    </section>
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
  font-size: 1.5rem;
  color: var(--color-text);
  background: var(--bg-theme-toggle);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(1px);
  transition: all var(--transition-normal) ease;
}

.theme-toggle:hover {
  background-color: var(--bg-theme-toggle-hover);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
}

.theme-toggle:active {
  transform: scale(0.95);
}

/* Debug area (preserved) */
.flag-item, .data-item {
  display: block;
  margin-left: 10px;
  color: var(--text-debug);
}

/* Theme-specific app-frame styling */
.app-frame {
  transition: background var(--fade-duration) ease-in-out,
              box-shadow var(--fade-duration) ease-in-out;
}

.app-frame.dark-theme {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15)) border-box,
              linear-gradient(180deg, rgba(15, 25, 50, 0.95), rgba(10, 15, 35, 0.98)) padding-box;
  box-shadow: 0 10px 40px rgba(0,0,0,0.7), 0 2px 15px rgba(0,0,0,0.5);
}
</style>