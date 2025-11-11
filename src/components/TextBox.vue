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
    <div class="text-panel" ref="storyBox">
        <div class="story-content">
            <Fade>
                <p v-for="(text, index) in displayedTexts" :key="index">
                    {{ text }}
                    <span v-if="index === displayedTexts.length - 1 && isTyping" class="cursor">|</span>
                </p>
            </Fade>
        </div>
    </div>
</template>

<style scoped>
    .text-panel {
        height: 100%;
        overflow-y: auto;
        padding: clamp(14px, 2cqw, 24px) clamp(16px, 3cqw, 32px);
        background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.20)), radial-gradient(1000px 600px at 50% 0%, rgba(34,211,238,0.04), transparent 60%), rgba(11,19,46,0.85);
        border-radius: 10px;
        scrollbar-width: none;
    }

        .text-panel::-webkit-scrollbar {
            display: none;
        }

        .text-panel::before {
            content: "";
            position: absolute;
            inset: 8px;
            border-radius: 8px;
            pointer-events: none;
            box-shadow: inset 0 0 0 1px rgba(148,163,184,0.18);
        }

        .text-panel::after {
            content: "";
            position: absolute;
            inset: 14px;
            border-radius: 6px;
            pointer-events: none;
            box-shadow: inset 0 0 0 1px rgba(51,65,85,0.35);
        }

    .story-content {
        font-family: "Crimson Text", serif;
        font-size: clamp(1.05rem, 1.6cqw, 1.25rem);
        font-weight: 400;
        line-height: 1.65;
        color: #e6edf6;
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
