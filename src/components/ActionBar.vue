<script setup lang="ts">
    const props = defineProps<{
        actions: Array<string>
    }>();

    const emit = defineEmits<{
        selected: [action: string]
    }>();
</script>

<template>
    <div id="actions">
        <template v-for="(action, index) in actions" :key="index">
            <button @click="emit('selected', action)">{{ action }}</button>
        </template>
    </div>
</template>

<style scoped>
    #actions {
        display: flex;
        justify-content: space-around;
        align-items: baseline;
        gap: 3em;
        margin: 5cqh 5cqw;
    }

    button {
        font-family: "Crimson Text", serif;
        font-weight: 700;
        font-size: 1.7em;
        transition-duration: 0.4s;
        background-color: #0000;
        color: rgb(211, 214, 225);
        border: none;
    }

    button:hover {
        color: rgb(255, 255, 255);
    }

    button:active {
        color: rgb(211, 214, 225);
        transition-duration: 0.1s;
    }
</style>