<template>
  <div class="save-load-container">
    <!-- Save/Load Button -->
    <button @click="toggleModal" class="save-load-button" title="Save/Load Game">
      <svg fill="#ecad65" viewBox="-6.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ecad65"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>save</title> <path d="M12.188 4.469v4.656h2.438l-4.875 5.875-4.875-5.875h2.563v-4.656h4.75zM16.313 12l2.844 4.5c0.156 0.375 0.344 1.094 0.344 1.531v8.656c0 0.469-0.375 0.813-0.813 0.813h-17.844c-0.469 0-0.844-0.344-0.844-0.813v-8.656c0-0.438 0.156-1.156 0.313-1.531l2.844-4.5c0.156-0.406 0.719-0.75 1.125-0.75h1.281l1.313 1.594h-2.625l-2.531 4.625c-0.031 0-0.031 0.031-0.031 0.063 0 0.063 0 0.094-0.031 0.125h16.156v-0.125c0-0.031-0.031-0.063-0.031-0.094l-2.531-4.594h-2.625l1.313-1.594h1.25c0.438 0 0.969 0.344 1.125 0.75zM7.469 21.031h4.594c0.406 0 0.781-0.375 0.781-0.813 0-0.406-0.375-0.781-0.781-0.781h-4.594c-0.438 0-0.813 0.375-0.813 0.781 0 0.438 0.375 0.813 0.813 0.813z"></path> </g></svg>
    </button>

    <!-- Modal - Teleported to body to escape parent positioning -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <!-- Rest of your modal content stays exactly the same -->
          <div class="modal-header">
            <h2>Save / Load Game</h2>
            <button @click="closeModal" class="close-button">×</button>
          </div>

          <div class="modal-body">

            <!-- Auto-Save Section -->
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

            <!-- Manual Saves Section -->
            <div class="save-section">
              <h3>Manual Saves</h3>
              <input 
                type="file" 
                ref="inputFile"
                @change="importFile"
                accept=".json"
                style="display: none"
              />
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
                  <button 
                    @click="exportSlot(`slot${slotNum}`)" 
                    :disabled="!manualSaveMetadata[slotNum - 1]"
                    class="export-button"
                    title="Export save"
                  >
                    Export
                  </button>
                  <button
                  @click="triggerFileInput(`slot${slotNum}`)" 
                    :disabled="dialogueActive"
                    class="load-button"
                    title="Import save"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
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
const inputFile = ref<HTMLInputElement | null>(null);
const selectedSlot = ref<string | null>(null);


const toggleModal = () => {
  showModal.value = !showModal.value;
  if (showModal.value) {
    loadMetadata();
  }
};

const closeModal = () => {
  showModal.value = false;
};

const triggerFileInput = (slotId: string) => {
  selectedSlot.value = slotId;
  inputFile.value?.click();
};

const loadMetadata = async () => {
  autoSaveMetadata.value = await saveManager.getSaveMetadata('auto');
  for (let i = 1; i <= 3; i++) {
    manualSaveMetadata.value[i - 1] = await saveManager.getSaveMetadata(`slot${i}`);
  }
};

const createSaveData = (slotId: string): SaveData => {
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

const importFile = async (event: Event) => {
  try{
    const target = event.target as HTMLInputElement;
    const inputFile = target.files?.[0];
    const slotid = selectedSlot.value; 
    if (inputFile && slotid){
      const makeSave = await saveManager.importGame(inputFile, slotid);
      if (makeSave){
        await loadMetadata();
        alert(`Game save imported to ${slotid.toUpperCase()}!`);
      }
    } else
    {
      console.error('Failed to import save: SlotID failed to be retrieved');
      alert('Failed to retrieve SlotID')
    }
  } catch(error){
    console.error('Failed to import save:', error);
    alert('Failed to import save. Please make sure save file is in proper format.')
  }
  
  
}

const exportSlot = async (slotId: string) => {
  try {
    const saveData = await saveManager.loadGame(slotId);
    if (saveData){
      //if returns save data, then call the manager method to 
      // do the appropriate checks and write to disk  
      await saveManager.exportSave(saveData);
    }
    
  } catch(error){
    console.error('Failed to export save:', error);
    alert('Failed to export selected save. Please try again.')
  }
}


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
.save-load-container {
  position: relative;
  display: inline-block;
}

.save-load-button {
  font-family: var(--font-main, "Crimson Text", serif);
  font-weight: var(--font-weight-button, 700);
  font-size: 1.5em;
  width: 2.5em;
  height: 2.5em;
  background-color: var(--bg-speed-btn, rgba(211, 214, 225, 0.1));
  color: var(--color-text, rgb(211, 214, 225));
  border: 2px solid var(--bg-speed-btn-border, rgb(211, 214, 225));
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
  border-color: var(--color-accent, rgb(255, 255, 255));
  transform: scale(1.1);
  box-shadow: var(--shadow-speed-btn-hover, 0 0 12px rgba(66, 180, 251, 0.5));
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
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal, 1000);
  margin: 0;
  padding: 0;
}

.modal-content {
  background: var(--color-box, rgb(2, 6, 23));
  color: var(--color-text, rgb(211, 214, 225));
  border: var(--border-width, 2px) solid var(--color-border, rgb(211, 214, 225));
  border-radius: var(--border-radius, 8px);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  font-family: var(--font-story, "Crimson Text", serif);
  box-shadow: var(--shadow-textbox-outer, 0 10px 40px rgba(0, 0, 0, 0.5));
  position: relative;
  margin: auto;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(211, 214, 225, 0.1);
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--color-accent, rgba(211, 214, 225, 0.3));
  border-radius: 4px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em 1.5em;
  border-bottom: 1px solid var(--color-border, rgba(211, 214, 225, 0.3));
}

.modal-header h2 {
  margin: 0;
  font-size: 2em;
  font-weight: var(--font-weight-button, 700);
  color: var(--color-text, rgb(211, 214, 225));
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text, rgb(211, 214, 225));
  font-size: 2.5em;
  cursor: pointer;
  padding: 0;
  width: 1em;
  height: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: color var(--transition-normal, 0.2s);
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

.save-section:last-child {
  margin-bottom: 0;
}

.save-section h3 {
  margin: 0 0 1em 0;
  font-size: 1.5em;
  font-weight: var(--font-weight-button, 600);
  color: var(--color-text, rgb(211, 214, 225));
  border-bottom: 1px solid var(--color-border, rgba(211, 214, 225, 0.3));
  padding-bottom: 0.5em;
}

.save-slot {
  background: rgba(211, 214, 225, 0.05);
  border: 1px solid var(--color-border, rgba(211, 214, 225, 0.2));
  border-radius: 6px;
  padding: 1em;
  margin-bottom: 0.75em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1em;
  transition: background var(--transition-normal, 0.2s);
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
  min-width: 0;
}

.slot-label {
  font-weight: var(--font-weight-button, 700);
  margin-bottom: 0.4em;
  font-size: 1.2em;
  color: var(--color-text, rgb(211, 214, 225));
}

.slot-metadata {
  font-size: 0.95em;
  color: rgba(211, 214, 225, 0.8);
}

.location {
  margin-bottom: 0.2em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timestamp {
  font-size: 0.9em;
  opacity: 0.8;
}

.slot-empty {
  font-size: 0.95em;
  color: rgba(211, 214, 225, 0.5);
  font-style: italic;
}

.slot-actions {
  display: flex;
  gap: 0.5em;
  flex-shrink: 0;
}

.save-button,
.load-button,
.delete-button,
.export-button,
.import-button {
  font-family: var(--font-main, "Crimson Text", serif);
  font-weight: var(--font-weight-button, 600);
  padding: 0.5em 1em;
  border: 2px solid;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: all var(--transition-normal, 0.2s);
  white-space: nowrap;
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
  box-shadow: 0 4px 12px rgba(100, 255, 100, 0.3);
}

.save-button:disabled {
  background: rgba(100, 100, 100, 0.1);
  color: var(--text-disabled, rgba(211, 214, 225, 0.3));
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
  box-shadow: 0 4px 12px rgba(100, 150, 255, 0.3);
}

.load-button:disabled {
  background: rgba(100, 100, 100, 0.1);
  color: var(--text-disabled, rgba(211, 214, 225, 0.3));
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
  box-shadow: 0 4px 12px rgba(255, 100, 100, 0.3);
}

.delete-button:disabled {
  background: rgba(100, 100, 100, 0.1);
  color: var(--text-disabled, rgba(211, 214, 225, 0.3));
  border-color: rgba(211, 214, 225, 0.2);
  cursor: not-allowed;
  opacity: 0.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  .save-slot {
    flex-direction: column;
    align-items: stretch;
  }

  .slot-actions {
    width: 100%;
    justify-content: space-between;
  }

  .save-button,
  .load-button,
  .delete-button {
    flex: 1;
    min-width: 0;
  }
}
</style>
