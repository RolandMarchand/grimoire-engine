<script setup lang="ts">
import StatusBar from "./components/StatusBar.vue";
import TextBox from "./components/TextBox.vue";
</script>

<template>
    <main>
        <TextBox></TextBox>
    </main>
</template>

<style scoped>
main {
    margin: 0;
    width: 100%;
    height: 100%;
    padding: 0;

    display: flex;
}
</style>
