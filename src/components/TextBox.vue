<script setup lang="ts">
import Fade from "./Fade.vue";
import { ref, watch, onMounted, computed } from "vue";

const props = defineProps<{
  paragraphs: Array<string>;
  typewriterSpeed?: number;
}>();

const emit = defineEmits<{
  typingComplete: [];
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
  <div id="text-panel" ref="storyBox">
    <div class="story-content">
      <Fade>
        <p v-for="(text, index) in displayedTexts" :key="index">
          <span v-html="text"></span><span v-if="index === displayedTexts.length - 1 && isTyping" class="cursor">|</span>
        </p>
      </Fade>
    </div>
  </div>
</template>

<style scoped>
#text-panel {
  /* Responsive sizing using clamp for better adaptability */
  width: var(--textbox-width, clamp(320px, 70vw, 900px));
  height: var(--textbox-height, 100%);
  
  padding: var(--padding-textbox, 1em);
  
  /* Background with CSS variables and fallbacks */
  background-image: var(--textbox-bg, linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.20)), radial-gradient(1000px 600px at 50% 0%, rgba(34,211,238,0.04), transparent 60%));
  background-color: var(--color-box, rgba(11,19,46,0.85));
  background-blend-mode: overlay;
  background-size: cover;
  
  color: var(--text-story, #e6edf6);
  text-shadow: var(--text-shadow-default, none);
  font-family: var(--font-story, "Crimson Text", serif);
  font-size: var(--font-size-textbox, clamp(1.05rem, 1.6cqw, 1.25rem));
  font-weight: var(--font-weight-main, 400);
  
  border-radius: var(--border-radius, 10px);
  
  box-shadow:
    var(--shadow-textbox-inset, none),
    var(--shadow-textbox-outer, none),
    var(--shadow-textbox-glow, none);
  backdrop-filter: blur(6px);
  
  overflow-y: auto;
  scrollbar-width: none;
  position: relative;
}

#text-panel::-webkit-scrollbar {
  display: none;
}

.story-content {
  display: flex;
  flex-direction: column;
  gap: var(--story-gap, 0.6em);
  line-height: var(--line-height, 1.65);
  letter-spacing: var(--letter-spacing, 0.03em);
}

.story-content p {
  margin: 0 0 0.9em;
}

.cursor {
  animation: blink 1s infinite;
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