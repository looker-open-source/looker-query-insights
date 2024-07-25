<script setup>
import { defineProps, inject, ref } from 'vue';
import { marked } from "marked";

const props = defineProps(['message'])
const vizConfig = inject('vizConfig')
const isActive = ref(false)

</script>

<template>
  <div class="tweet-container" :class="{ hover_shadow: isActive}" @mouseover="isActive = true" @mouseout="isActive = false">
    <div v-if="vizConfig.visConfig !== undefined" class="icon-container">
        <img width="5%" height="auto" :src="vizConfig.visConfig.insightImage ?? 'https://img.icons8.com/ios/50/light-on--v1.png'" alt="light-on--v1"/>
    </div>
    <div v-if="props.message" class="tweet-content" v-html="marked.parse(props.message.replace(/^```markdown\n/, ''))"></div>
  </div>
</template>

<style scoped>
    .icon-container {
        display: flex;
        width: 100%;
        height:auto;
    }
    .hover_shadow {
        transition: box-shadow 0.3s ease-in-out;
        box-shadow: 0 1px 10px var(--color-shadow)
    }
</style>