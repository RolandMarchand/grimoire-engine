<script setup lang="ts">
import { ref, reactive, h, onMounted } from "vue"
import Fade from "./Fade.vue"

const paragraphs = ref<string[]>([
    "Lorem ipsum odor amet, consectetuer adipiscing elit.",
    "Taciti turpis magna, vel habitasse mus mi consequat.",
    "Rutrum lacus massa magna, senectus integer nulla ut."
]);

const dynamic = reactive([
    h(Test, null, () => "hello"),
    h(Test, null, () => "hello2"),
    h(Test, null, () => "hello3"),
    h(Test, null, () => "hello4"),
    h(Test, null, () => "hello5"),
]);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

onMounted(async () => {
    while (false) {
        await sleep(2000);
        dynamic.push(h(Test, null, () => "hello5"));
    }
})

</script>

<template>
    <div id="story-box" ref="story-box">
        <Fade>
            <template v-for="(node, index) in dynamic"  :key="index">
                <component :is="node"></component>
            </template>
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
