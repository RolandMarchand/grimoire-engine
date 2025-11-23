<script setup lang="ts">
import Fade from "./Fade.vue";
import { ref, watch, onMounted, computed } from "vue";

const props = defineProps<{
  paragraphs: Array<string>;
  typewriterSpeed?: number;
}>();

const emit = defineEmits<{
  typingComplete: []
}>();

const storyBox = ref<HTMLDivElement | null>(null);
const displayedTexts = ref<Array<string>>([]);
const isTyping = ref<boolean>(false);

const speed = computed(() => props.typewriterSpeed ?? 0);

const scrollToBottom = async () => {
  setTimeout(() => {
    storyBox.value?.scrollTo({
      top: storyBox.value.scrollHeight,
      behavior: "smooth",
    });
  });
};

const typeWriter = async (text: string, index: number) => {
  displayedTexts.value.push("");

  if (speed.value === 0) {
    displayedTexts.value[index] = text;
    scrollToBottom();
    return;
  }

  for (let i = 0; i <= text.length; i++) {
    displayedTexts.value[index] = text.substring(0, i);
    await new Promise(resolve => setTimeout(resolve, speed.value));
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
  emit("typingComplete");
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
          {{ text }}
          <span v-if="index === displayedTexts.length - 1 && isTyping" class="cursor">|</span>
        </p>
      </Fade>
    </div>
    <br />
  </div>
</template>

<style>
#story-box {
  /* Use clamp to adapt to various screens, more stable than vh/vw */
  width: clamp(320px, 70vw, 900px);
  height: clamp(240px, 55vh, 540px);

  padding: var(--padding-textbox);
  background-image: var(--textbox-bg);
  background-color: var(--color-box);
  background-blend-mode: overlay;
  background-size: cover; 
  opacity: 1;

  color: var(--text-story);
  text-shadow: var(--text-shadow-default);
  font-family: var(--font-story);
  font-size: var(--font-size-textbox);
  font-weight: var(--font-weight-main);

  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius);

  box-shadow:
    var(--shadow-textbox-inset),
    var(--shadow-textbox-outer),
    var(--shadow-textbox-glow);
  backdrop-filter: blur(6px);

  overflow-y: auto;

  /* Hide scrollbar visually */
  scrollbar-width: none;
}
#story-box::-webkit-scrollbar { display: none; }

/* Paragraph layout control */
.story-content {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
  line-height: var(--line-height, 1.7);
  letter-spacing: var(--letter-spacing, 0.03em);
}

.cursor {
  animation: blink 1s infinite;
  opacity: 1;
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
</style>
