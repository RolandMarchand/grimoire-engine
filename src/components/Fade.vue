<script setup lang="ts">
function isAnimationEnabled(): boolean {
    // TODO: implement
    return true;
}
</script>

<template>
    <!-- Animations on -->
    <template v-if="isAnimationEnabled()">
        <TransitionGroup appear>
            <slot></slot>
        </TransitionGroup>
    </template>

    <!-- Animations off -->
    <template v-else>
        <slot></slot>
    </template>
</template>

<style>
.v-enter-active {
    transition: opacity 1s ease-out;
}

.v-leave-active {
  transition: opacity 1s ease-in;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
