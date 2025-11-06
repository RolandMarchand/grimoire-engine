<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Particle {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
}

const particles = ref<Particle[]>([]);

onMounted(() => {
  // Generate random particles
  particles.value = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDuration: 3 + Math.random() * 4,
    animationDelay: Math.random() * 3,
    size: 2 + Math.random() * 4
  }));
});
</script>

<template>
  <div class="grimoire-background">
    <div 
      class="glow-orb" 
      style="width: 300px; height: 300px; background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%); top: 20%; left: 10%; animation-duration: 4s;">
    </div>
    
    <div 
      class="glow-orb" 
      style="width: 400px; height: 400px; background: radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%); bottom: 10%; right: 15%; animation-duration: 5s; animation-delay: 1s;">
    </div>

    <div 
      class="glow-orb" 
      style="width: 250px; height: 250px; background: radial-gradient(circle, rgba(109, 40, 217, 0.25) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-duration: 6s; animation-delay: 2s;">
    </div>

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

    <div class="rune" style="top: 15%; left: 20%; animation-duration: 3s;">✦</div>
    <div class="rune" style="top: 60%; left: 80%; animation-duration: 4s; animation-delay: 1s;">✧</div>
    <div class="rune" style="top: 40%; left: 15%; animation-duration: 5s; animation-delay: 2s;">⟡</div>
    <div class="rune" style="top: 70%; left: 40%; animation-duration: 3.5s; animation-delay: 0.5s;">✦</div>
    <div class="rune" style="top: 25%; left: 70%; animation-duration: 4.5s; animation-delay: 1.5s;">⟡</div>
    <div class="rune" style="top: 80%; left: 60%; animation-duration: 3.8s; animation-delay: 2.2s;">✧</div>

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
  background: linear-gradient(135deg, #1a0033 0%, #2d0a4e 50%, #0f0020 100%);
  z-index: -1;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-10vh) rotate(360deg);
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
    opacity: 0.3;
  }
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