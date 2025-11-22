<template>
  <div class="save-load-container">
  
    <button @click="toggleModal" class="save-load-button" title="Save/Load Game">
      💾
    </button>

    
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Save / Load Game</h2>
          <button @click="closeModal" class="close-button">×</button>
        </div>

        <div class="modal-body">
       
          <div class="save-section">
            <h3>Auto-Save</h3>
            <div class="save-slot auto-save">
              <div class="slot-info">
                <div class="slot-label">Auto-Save</div>
                <div v-if="autoSaveMetadata" class="slot-metadata">
                  <div class="location">📍 {{ autoSaveMetadata.location }}</div>
                  <div class="timestamp">🕒 {{ formatTimestamp(autoSaveMetadata.timestamp) }}</div>
                </div>
                <div v-else class="slot-empty">No auto-save available</div>
              </div>
              <div class="slot-actions">
                <button 
                  @click="loadSlot('auto')" 
                  :disabled="!autoSaveMetadata"
                  class="load-button"
                >
                  Load
                </button>
              </div>
            </div>
          </div>

         
          <div class="save-section">
            <h3>Manual Saves</h3>
            <div 
              v-for="slotNum in [1, 2, 3]" 
              :key="slotNum" 
              class="save-slot"
            >
              <div class="slot-info">
                <div class="slot-label">Slot {{ slotNum }}</div>
                <div v-if="manualSaveMetadata[slotNum - 1]" class="slot-metadata">
                  <div class="location">📍 {{ manualSaveMetadata[slotNum - 1]!.location }}</div>
                  <div class="timestamp">🕒 {{ formatTimestamp(manualSaveMetadata[slotNum - 1]!.timestamp) }}</div>
                </div>
                <div v-else class="slot-empty">Empty</div>
              </div>
              <div class="slot-actions">
                <button 
                  @click="saveSlot(`slot${slotNum}`)" 
                  :disabled="dialogueActive"
                  class="save-button"
                  :title="dialogueActive ? 'Cannot save during dialogue' : 'Save game'"
                >
                  Save
                </button>
                <button 
                  @click="loadSlot(`slot${slotNum}`)" 
                  :disabled="!manualSaveMetadata[slotNum - 1]"
                  class="load-button"
                >
                  Load
                </button>
                <button 
                  @click="deleteSlot(`slot${slotNum}`)" 
                  :disabled="!manualSaveMetadata[slotNum - 1]"
                  class="delete-button"
                  title="Delete save"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { saveManager, type SaveData, type SaveMetadata } from '../core/save-manager';


const props = defineProps<{
  gameState: {
    currentRoom: string;
    inventory: string[];
    flag: Record<string, boolean>;
    data: Record<string, any>;
  };
  currentRoomName: string;
  paragraphs: string[];
  dialogueActive: boolean;
}>();


const emit = defineEmits<{
  load: [saveData: SaveData];
  saved: [];
}>();


const showModal = ref(false);
const autoSaveMetadata = ref<SaveMetadata | null>(null);
const manualSaveMetadata = ref<Array<SaveMetadata | null>>([null, null, null]);


const toggleModal = () => {
  showModal.value = !showModal.value;
  if (showModal.value) {
    loadMetadata();
  }
};

const closeModal = () => {
  showModal.value = false;
};

const loadMetadata = async () => {
 
  autoSaveMetadata.value = await saveManager.getSaveMetadata('auto');


  for (let i = 1; i <= 3; i++) {
    manualSaveMetadata.value[i - 1] = await saveManager.getSaveMetadata(`slot${i}`);
  }
};

const createSaveData = (slotId: string): SaveData => {
  // Keep only last 20 messages
  const recentMessages = props.paragraphs.slice(-20);

  return {
    slotId,
    timestamp: Date.now(),
    location: props.currentRoomName,
    gameState: {
      currentRoom: props.gameState.currentRoom,
      inventory: [...props.gameState.inventory],
      flag: { ...props.gameState.flag },
      data: { ...props.gameState.data },
      messageHistory: recentMessages,
    },
  };
};

const saveSlot = async (slotId: string) => {
  if (props.dialogueActive) {
    alert('Cannot save during dialogue. Please finish or exit the dialogue first.');
    return;
  }
  
  try {
    const saveData = createSaveData(slotId);
    await saveManager.saveGame(saveData);
    await loadMetadata(); 
    emit('saved');
    
    
    alert(`Game saved to ${slotId === 'auto' ? 'Auto-Save' : slotId.toUpperCase()}!`);
  } catch (error) {
    console.error('Failed to save game:', error);
    alert('Failed to save game. Please try again.');
  }
};

const loadSlot = async (slotId: string) => {
  try {
    const saveData = await saveManager.loadGame(slotId);
    if (saveData) {
      if (confirm(`Load save from ${saveData.location}?`)) {
        emit('load', saveData);
        closeModal();
      }
    }
  } catch (error) {
    console.error('Failed to load game:', error);
    alert('Failed to load game. Please try again.');
  }
};

const deleteSlot = async (slotId: string) => {
  if (confirm('Are you sure you want to delete this save?')) {
    try {
      await saveManager.deleteSave(slotId);
      await loadMetadata(); 
    } catch (error) {
      console.error('Failed to delete save:', error);
      alert('Failed to delete save. Please try again.');
    }
  }
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};


const autoSave = async () => {
  try {
    const saveData = createSaveData('auto');
    await saveManager.saveGame(saveData);
    console.log('Auto-saved');
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
};


defineExpose({
  autoSave,
});


onMounted(() => {
  loadMetadata();
});
</script>

<style scoped>
.save-load-button {
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

.save-load-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: rgb(255, 255, 255);
  border-color: rgb(255, 255, 255);
  transform: scale(1.1);
}

.save-load-button:active {
  transform: scale(0.95);
  background-color: rgba(159, 163, 179, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgb(2, 6, 23);
  color: rgb(211, 214, 225);
  border: 2px solid rgb(211, 214, 225);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  font-family: "Crimson Text", serif;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em 1.5em;
  border-bottom: 1px solid rgba(211, 214, 225, 0.3);
}

.modal-header h2 {
  margin: 0;
  font-size: 2em;
  font-weight: 700;
  color: rgb(211, 214, 225);
}

.close-button {
  background: none;
  border: none;
  color: rgb(211, 214, 225);
  font-size: 2.5em;
  cursor: pointer;
  padding: 0;
  width: 1em;
  height: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: color 0.2s;
}

.close-button:hover {
  color: rgb(255, 100, 100);
}

.modal-body {
  padding: 1.5em;
}

.save-section {
  margin-bottom: 2em;
}

.save-section h3 {
  margin: 0 0 1em 0;
  font-size: 1.5em;
  font-weight: 600;
  color: rgb(211, 214, 225);
  border-bottom: 1px solid rgba(211, 214, 225, 0.3);
  padding-bottom: 0.5em;
}

.save-slot {
  background: rgba(211, 214, 225, 0.05);
  border: 1px solid rgba(211, 214, 225, 0.2);
  border-radius: 6px;
  padding: 1em;
  margin-bottom: 0.75em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.save-slot:hover {
  background: rgba(211, 214, 225, 0.08);
}

.save-slot.auto-save {
  border-color: rgba(255, 200, 100, 0.5);
  background: rgba(255, 200, 100, 0.05);
}

.slot-info {
  flex: 1;
}

.slot-label {
  font-weight: 700;
  margin-bottom: 0.4em;
  font-size: 1.2em;
  color: rgb(211, 214, 225);
}

.slot-metadata {
  font-size: 0.95em;
  color: rgba(211, 214, 225, 0.8);
}

.location {
  margin-bottom: 0.2em;
}

.slot-empty {
  font-size: 0.95em;
  color: rgba(211, 214, 225, 0.5);
  font-style: italic;
}

.slot-actions {
  display: flex;
  gap: 0.5em;
}

.save-button,
.load-button,
.delete-button {
  font-family: "Crimson Text", serif;
  font-weight: 600;
  padding: 0.5em 1em;
  border: 2px solid;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.2s;
}

.save-button {
  background: rgba(100, 200, 100, 0.2);
  color: rgb(100, 255, 100);
  border-color: rgb(100, 200, 100);
}

.save-button:hover:not(:disabled) {
  background: rgba(100, 255, 100, 0.3);
  border-color: rgb(100, 255, 100);
  transform: translateY(-2px);
}

.save-button:disabled {
  background: rgba(100, 100, 100, 0.1);
  color: rgba(211, 214, 225, 0.3);
  border-color: rgba(211, 214, 225, 0.2);
  cursor: not-allowed;
  opacity: 0.5;
}

.load-button {
  background: rgba(100, 150, 255, 0.2);
  color: rgb(150, 200, 255);
  border-color: rgb(100, 150, 255);
}

.load-button:hover:not(:disabled) {
  background: rgba(150, 200, 255, 0.3);
  border-color: rgb(150, 200, 255);
  transform: translateY(-2px);
}

.load-button:disabled {
  background: rgba(100, 100, 100, 0.1);
  color: rgba(211, 214, 225, 0.3);
  border-color: rgba(211, 214, 225, 0.2);
  cursor: not-allowed;
  opacity: 0.5;
}

.delete-button {
  background: rgba(255, 100, 100, 0.2);
  color: rgb(255, 150, 150);
  border-color: rgb(255, 100, 100);
  padding: 0.5em 0.75em;
}

.delete-button:hover:not(:disabled) {
  background: rgba(255, 100, 100, 0.3);
  border-color: rgb(255, 150, 150);
  transform: translateY(-2px);
}

.delete-button:disabled {
  background: rgba(100, 100, 100, 0.1);
  color: rgba(211, 214, 225, 0.3);
  border-color: rgba(211, 214, 225, 0.2);
  cursor: not-allowed;
  opacity: 0.5;
}
</style>