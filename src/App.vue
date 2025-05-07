<script setup lang="ts">

    import StatusBar from "./components/StatusBar.vue";
    import TextBox from "./components/TextBox.vue";
    import ActionBar from "./components/ActionBar.vue";

    import { getZone } from "./core/game-definition.ts";

    import { ref } from 'vue';

    getZone();

    const paragraphs: Ref<Array<string>> = ref([
        "Lorem ipsum odor amet, consectetuer adipiscing elit.",
        "Taciti turpis magna, vel habitasse mus mi consequat.",
        "Rutrum lacus massa magna, senectus integer nulla ut."
    ]);

    const actions: Ref<Array<string>> = ref([
        "Fuck",
        "Mary",
        "Kill",
        "Nothing",
    ]);

    function doAction(action: string): void {
        if (action === "Nothing") {
            paragraphs.value.push("");
        } else {
            paragraphs.value.push(action);
        }
    }
</script>

<template>
    <main>
        <TextBox :paragraphs="paragraphs"></TextBox>
        <ActionBar :actions="actions" @selected="doAction"></ActionBar>
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
</style>
