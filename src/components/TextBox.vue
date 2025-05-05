<script setup lang="ts">
import Fade from "./Fade.vue";

const props = defineProps<{
  paragraphs: Array<string>,
}>();
</script>

<template>
    <div id="story-box" ref="story-box">
        <Fade>
            <template v-for="(text, index) in props.paragraphs" :key="index">
                <p>{{ text }}</p>
            </template>
        </Fade>
        <br>
    </div>
</template>

<style scoped>
#story-box {
    background-color: rgba(2, 6, 23, 0.5);
    border-radius: 10px;

    padding: 10cqh 10cqw;
    overflow-y: auto;

    flex: 1;

    font-family: "Crimson Text", serif;
    font-weight: 400;
    font-size: 1.5em;
}

</style>
