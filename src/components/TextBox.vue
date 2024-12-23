<script setup lang="ts">
import Fade from "./Fade.vue"
</script>

<template>
    <div id="story-box">
        <Fade>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum consequat nunc ac ante porta, in tempor massa blandit. Praesent eu lorem in nulla facilisis congue at sit amet nunc. Donec vehicula magna at augue vehicula, vel placerat dui tempor.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <p>Fusce sed mauris vitae nisi convallis tincidunt. Maecenas vestibulum elit sit amet lorem tempus hendrerit. Nulla facilisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Cras eget dolor eget nisl tincidunt commodo.</p>
            <p>Nam lacinia velit non felis convallis, eu tincidunt nisi porttitor. Nullam facilisis risus in lectus egestas, vel faucibus nunc fringilla. Suspendisse potenti. Proin feugiat libero eu ligula cursus, vitae ullamcorper sapien condimentum.</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Integer non turpis ac nunc fermentum varius vitae non lorem. Vivamus vitae tellus in nisi venenatis tincidunt vel non metus.</p>
        </Fade>
    </div>
</template>

<style scoped>
#story-box {
    background-color: rgba(2, 6, 23, 0.5);
    border-radius: 10px;

    padding: 10cqh 10cqw;

    flex: 1;
/*     display: flex;
    flex-direction: column; */
}
</style>
