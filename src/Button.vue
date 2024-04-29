

<template>
  <button @click="inc">{{ count }}</button>
</template>

<script setup>
import Button from "./Button.vue"
import { ref, computed } from "vue";

const count = ref(0);
computed(() => count.value++)
</script>

<style scoped>
button {
  font-size: 100px;
  background: salmon;
  border-radius: 250px;
  padding: 20px;
  display: inline-block;
  min-width: 200px;
  user-select: none;
}
button:active {
  background-color: orangered;
}
</style>
