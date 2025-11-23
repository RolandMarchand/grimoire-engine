<template>
  <div class="animated-bg">
    <div class="cloud-layer"></div>
  </div>
</template>

<style>
.animated-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: transparent;

}

.cloud-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 300%;
  height: 100%;
  background-image: var(--sky-tex);
  background-repeat: var(--sky-repeat, repeat-x);
  background-size: var(--sky-size, contain);
  opacity: 1;
  animation: scrollClouds var(--sky-speed, 300s) linear infinite;
}

@keyframes scrollClouds {
  from { background-position-x: 0; }
  to   { background-position-x: -100%; }
}
</style>
