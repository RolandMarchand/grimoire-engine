<script setup lang="ts">

</script>

<template>
    <TransitionGroup appear name="fade" tag="div" id="fade-div">
        <slot></slot>
    </TransitionGroup>
</template>

<style>
#fade-div > * {
    opacity: 0.6;
    transition: opacity 1s ease;
}

#fade-div > :last-child {
    opacity: 1;
}

#fade-div > .fade-enter-from,
#fade-div > .fade-leave-to {
    opacity: 0;
}
</style>
