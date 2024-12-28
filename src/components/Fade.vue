<script setup lang="ts">
function isAnimationEnabled(): boolean {
    // TODO: implement
    return true;
}
</script>

<template>
    <div id="fade-div">
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
    </div>
</template>

<style>
#fade-div > * {
    opacity: 0.6;
}

#fade-div > *:last-child {
    opacity: 1;
}

.v-enter-active {
    transition: opacity 1s ease-out;
}

.v-leave-active {
    transition: opacity 1s ease-in;
}

#fade-div > .v-enter-from,
#fade-div > .v-leave-to {
    opacity: 0;
}
</style>
