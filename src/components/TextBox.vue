<script setup lang="ts">
    import Fade from "./Fade.vue";

    import { ref, watch, onMounted } from 'vue';

    const props = defineProps<{
    paragraphs: Array<string>,
    }>();

    const storyBox = ref(null);

    const scrollToBottom = () => {
        if (storyBox.value && props.paragraphs.length > 0) {
            storyBox.value.scrollTo({
                top: storyBox.value.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    watch(() => props.paragraphs.length, scrollToBottom, { flush: 'post' });

    onMounted(scrollToBottom);
</script>

<template>
    <div id="story-box" ref="storyBox">
        <Fade>
            <template v-for="(text, index) in props.paragraphs" :key="index">
                <br v-if="text.trim().length <= 0">
                <p v-else>{{ text }}</p>
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

        /* For Firefox */
        scrollbar-width: none;
        
        /* For Chrome, Safari, and Opera */
        &::-webkit-scrollbar {
            display: none;
        }
    }
</style>
