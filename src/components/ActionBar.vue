<script setup lang="ts">
    import { ref } from 'vue';

    const props = defineProps<{
        actions: Array<string>
    }>();

    const emit = defineEmits<{
        selected: [action: string]
    }>();

    const isDisabled = ref(false);

    const clickButton = (action: string): void => {
        emit('selected', action)

        isDisabled.value = true;
        setTimeout(() => {
            isDisabled.value = false;
        }, 500);
    }
</script>

<template>
    
    <div id="actions">
        <template v-for="(action, index) in actions" :key="index">
            <button @click="clickButton(action)" :disabled="isDisabled">
                {{ action }}
            </button>
        </template>
    </div>
</template>

<style>
    #actions {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;

        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--gap-actionbar);
        padding: var(--padding-actionbar);
    }

    /* Action Bar button styles - override global button styles */
    #actions button {
        font-family: var(--font-story);
        font-weight: var(--font-weight-button);
        font-size: var(--font-size-button-large);
        transition-duration: var(--transition-slow);
        background-color: transparent;
        color: var(--text-action);
        text-shadow: var(--text-shadow-default);
        border: none;
    }

    #actions button:hover {
        color: var(--text-hover);
        text-shadow: var(--text-glow-strong);
    }

    #actions button:active {
        color: var(--text-active);
        transition-duration: var(--transition-fast);
    }

    #actions button:disabled {
        color: var(--text-disabled);
        transition-duration: var(--transition-fast);
    }
</style>