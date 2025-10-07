<script setup lang="ts">
import Fade from "./Fade.vue";
import { ref, watch, onMounted } from "vue";

const props = defineProps<{
  paragraphs: Array<string>;
}>();

const storyBox = ref<HTMLDivElement | null>(null);
const displayedTexts = ref<Array<string>>([]);
const isTyping = ref<boolean>(false);

const typewriterSpeed = 10;

const scrollToBottom = () => {
  if (storyBox.value) {
    storyBox.value.scrollTo({
      top: storyBox.value.scrollHeight,
      behavior: "smooth",
    });
  }
};

const typeWriter = async (text: string, index: number) => {
  displayedTexts.value.push("");
  
  for (let i = 0; i <= text.length; i++) {
    displayedTexts.value[index] = text.substring(0, i);
    await new Promise(resolve => setTimeout(resolve, typewriterSpeed));
    scrollToBottom();
  }
};

const processNewParagraphs = async () => {
  if (isTyping.value) return;
  isTyping.value = true;

  while (displayedTexts.value.length < props.paragraphs.length) {
    const nextIndex = displayedTexts.value.length;
    const nextText = props.paragraphs[nextIndex];
    await typeWriter(nextText, nextIndex);
  }
  
  isTyping.value = false;
};

watch(() => props.paragraphs.length, () => {
  processNewParagraphs();
});

onMounted(() => {
  scrollToBottom();
  processNewParagraphs();
});
</script>

<template>
  <div id="story-box" ref="storyBox">
    <div class="story-content">
      <Fade>
        <p v-for="(text, index) in displayedTexts" :key="index">
          {{ text }}<span v-if="index === displayedTexts.length - 1 && isTyping" class="cursor">|</span>
        </p>
      </Fade>
    </div>
    <br />
  </div>
</template>

<style scoped>
#story-box {
  background-color: rgba(2, 6, 23, 0.5);

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

.cursor {
  animation: blink 1s infinite;
  opacity: 1;
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}
</style>