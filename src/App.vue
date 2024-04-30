<script setup>
import { defineComponent } from 'vue'

import Button from './components/Button.vue'
import LeftBanner from './components/LeftBanner.vue'

</script>

<template>
  <div class="dot-grid-background"></div>
  <div class="webpage">
    <div class="column-flex">
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style>
body {
  font-family: -apple-system, system-ui, BlinkMacSystemFont;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.webpage {
  display:flex;
  flex-direction: row;
  justify-content:space-evenly;
}

.column-flex {
  display:flex;
  flex-direction:column;
  width:100%;
}

.dot-grid-background {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    background-color: #fff;
    background-image: radial-gradient(circle, rgba(100, 117, 139, .5) 1px, transparent 1px);
    background-size: 25px 25px;
  }
</style>