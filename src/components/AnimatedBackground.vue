<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Particle {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
}

interface Rune {
  id: number;
  symbol: string;
  top: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
}

const particles = ref<Particle[]>([]);
const runes = ref<Rune[]>([]);

onMounted(() => {
  particles.value = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDuration: 3 + Math.random() * 10,
    animationDelay: Math.random() * 3,
    size: 2 + Math.random() * 4
  }));

  const runeSymbols = ['✦', '✧', '⟡'];
  runes.value = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    symbol: runeSymbols[Math.floor(Math.random() * runeSymbols.length)],
    top: Math.random() * 90 + 5,
    left: Math.random() * 90 + 5,
    animationDuration: 3 + Math.random() * 2.5,
    animationDelay: Math.random() * 3
  }));
});
</script>

<template>
  <div class="grimoire-background">
    <div class="clouds"></div>
    <!-- <div 
      class="glow-orb" 
      style="width: 300px; height: 300px; background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 100%); top: 20%; left: 10%; animation-duration: 4s;">
    </div>
    
    <div 
      class="glow-orb" 
      style="width: 400px; height: 400px; background: radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%); bottom: 10%; right: 15%; animation-duration: 5s; animation-delay: 1s;">
    </div>

    <div 
      class="glow-orb" 
      style="width: 250px; height: 250px; background: radial-gradient(circle, rgba(109, 40, 217, 0.25) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-duration: 6s; animation-delay: 2s;">
    </div> -->
<!--
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="{
        left: particle.left + '%',
        width: particle.size + 'px',
        height: particle.size + 'px',
        animationDuration: particle.animationDuration + 's',
        animationDelay: particle.animationDelay + 's'
      }">
    </div>

    <div
      v-for="rune in runes"
      :key="rune.id"
      class="rune"
      :style="{
        top: rune.top + '%',
        left: rune.left + '%',
        animationDuration: rune.animationDuration + 's',
        animationDelay: rune.animationDelay + 's'
      }">
      {{ rune.symbol }}
    </div>
-->
  </div>
</template>

<style scoped>
.grimoire-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: url('../assets/backImage.jpg') no-repeat center;
  background-size: 2000px;
  /*background: linear-gradient(135deg, #1a0033 0%, #2d0a4e 50%, #0f0020 100%);*/
  z-index: -1;
}

@keyframes float {
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}

@keyframes shimmer {
  0%, 100% {
    opacity: 0.1;
  }
  50% {
    opacity: 1;
  }
}

@keyframes move-background {
  from {
    -webkit-transform: translate3d(0px, 0px, 0px);
  }
  to { 
    -webkit-transform: translate3d(1000px, 0px, 0px);
  }
}
@-webkit-keyframes move-background {
  from {
    -webkit-transform: translate3d(0px, 0px, 0px);
  }
  to { 
    -webkit-transform: translate3d(1000px, 0px, 0px);
  }
}

@-moz-keyframes move-background {    
  from {
    -webkit-transform: translate3d(0px, 0px, 0px);
  }
  to { 
    -webkit-transform: translate3d(1000px, 0px, 0px);
  }
}

    @-webkit-keyframes move-background {
  from {
    -webkit-transform: translate3d(0px, 0px, 0px);
  }
  to { 
    -webkit-transform: translate3d(1000px, 0px, 0px);
  }
}

.clouds{
  width:10000px;
  height: 100%;
  background: transparent url("../assets/cloud1.png") repeat;
  background-size: 500px 500px;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2;
  opacity: 0.5;
  -moz-animation:move-background 150s linear infinite;
  -ms-animation:move-background 150s linear infinite;
  -o-animation:move-background 150s linear infinite;
  -webkit-animation:move-background 150s linear infinite;
  animation:move-background 150s linear infinite;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.8) 0%, rgba(139, 92, 246, 0.4) 50%, transparent 100%);
  border-radius: 50%;
  pointer-events: none;
  animation: float linear infinite;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: pulse ease-in-out infinite;
}

.rune {
  position: absolute;
  color: rgba(167, 139, 250, 0.2);
  font-size: 24px;
  animation: shimmer ease-in-out infinite;
  pointer-events: none;
}
</style>