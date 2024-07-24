<!-- MIT License

Copyright (c) 2023 Looker Data Sciences, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. -->


<script setup>
import { inject, watch, ref, onMounted, onUnmounted } from 'vue';
import Message from './Message.vue';
import { useLookerVertexMessage } from './composables/useLookerVertexMessage';
import { vizConfigSettings } from './constants';
import { stringToHash, extractNestedValuesGenerator } from './utils';

const vizConfig = inject('vizConfig');
const extensionSdk = inject('extensionSdk');
const sdk = inject('sdk');
const dataHash = ref(null);
const settingsLoaded = ref(false);
const { sendMessage, loading, results } = useLookerVertexMessage(sdk);

onMounted(() => {
  extensionSdk.visualizationSDK.configureVisualization(vizConfigSettings);
  settingsLoaded.value = true;
});

onUnmounted(() => {
  settingsLoaded.value = false;
});

watch(() => vizConfig.value, (newVizConfig) => {
  if (!settingsLoaded.value || !newVizConfig) return;

  const { queryResponse, visConfig } = newVizConfig;
  if (!queryResponse || !visConfig) return;

  const { data, fields } = queryResponse;
  if (!data || data.length === 0) return;

  const newDataHash = stringToHash(visConfig.prompt + JSON.stringify(data));
  if (newDataHash === dataHash.value) return;

  dataHash.value = newDataHash;

  const { dimensions, measures, pivots, table_calculations } = fields;
  const queryMetadata = {
    dimensions: dimensions?.map(d => ({ field: d.name, label: d.label, description: d.description })),
    measures: measures?.map(d => ({ field: d.name, label: d.label, description: d.description })),
    pivots,
    tableCalculations: table_calculations
  };

  sendMessage(
    queryMetadata,
    extractNestedValuesGenerator(data),
    visConfig.prompt ?? 'summarize',
    visConfig.temperature ?? 0.2,
    visConfig.query ?? ''
  );
}, { deep: true });

watch(() => vizConfig.value?.visConfig, (newVisConfig) => {
  if (!newVisConfig) return;

  const { headerColor, backgroundColor, textColor, shadowColor, cardColor } = newVisConfig;
  const root = document.documentElement.style;
  root.setProperty('--color-background', backgroundColor);
  root.setProperty('--color-header', headerColor);
  root.setProperty('--color-card', cardColor);
  root.setProperty('--color-text', textColor);
  root.setProperty('--color-shadow', shadowColor);
}, { deep: true });
</script>

<template>
  <div v-if="!loading && vizConfig">
    <Message :message="results" />
  </div>
  <span v-else>Loading Insights...</span>
</template>

<style>
body {
  font-family: -apple-system, system-ui, BlinkMacSystemFont, sans-serif;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80%;
  width: 80%;
}
</style>