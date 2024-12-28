<script setup lang="ts">
import { ref } from "vue"
import Fade from "./Fade.vue"

const paragraphs = ref<string[]>([
    "Lorem ipsum odor amet, consectetuer adipiscing elit.",
    "Taciti turpis magna, vel habitasse mus mi consequat.",
    "Rutrum lacus massa magna, senectus integer nulla ut."
]);

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function addLmaos() {
    while (false) {
        paragraphs.value.push("lmao!!");
        await delay(1000);
    }
}
addLmaos();
</script>

<template>
    <div id="story-box" ref="story-box">
        <Fade>
            <template v-for="(text, index) in paragraphs" :key="index">
                <p>{{ text }}</p>
            </template>
        </Fade>
    </div>
</template>

<style scoped>
#story-box {
    background-color: rgba(2, 6, 23, 0.5);
    border-radius: 10px;

    padding: 10cqh 10cqw;
    overflow-y: auto;

    flex: 1;
/*     display: flex;
    flex-direction: column; */
}
</style>
