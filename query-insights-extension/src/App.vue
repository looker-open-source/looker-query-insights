<!-- Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->


<script setup>
import { inject, watch, watchEffect, ref, onMounted } from 'vue';
import Message from './Message.vue';
import { useLookerVertexMessage } from './composables/useLookerVertexMessage';
import { vizConfigSettings } from './constants';
import { stringToHash, extractNestedValuesGenerator } from './utils';

const vizConfig = inject('vizConfig');
const extensionSdk = inject('extensionSdk');
const tileData = inject('tileData')
const sdk = inject('sdk');
const dataChanged = ref(null);
const dataHash = ref(null);
const settingsLoaded = ref(false);
const { sendMessage, loading, results } = useLookerVertexMessage(sdk);

onMounted(() => {
  extensionSdk.visualizationSDK.configureVisualization(vizConfigSettings);
  settingsLoaded.value = true;
});

watchEffect(() => console.log("Tile Data: ", tileData.value))

watchEffect(async() =>  {
  if (!settingsLoaded.value || !vizConfig.value) return;
  
  const { queryResponse, visConfig } = vizConfig.value;
  if (!queryResponse || !visConfig) return;

  const { data, fields, sql } = queryResponse;
  if (!data || data.length === 0) return;

  // if parent id exists (only in explore) and parent id hasn't changed (ie. only viz settings changes) return
  if('parent_id' in queryResponse && queryResponse.parent_id === dataChanged.value) return;

  // else (ie. query changed, query run) trigger new call
  dataChanged.value = queryResponse.parent_id

  const newDataHash = stringToHash(visConfig.prompt + visConfig.temperature + visConfig.query +  JSON.stringify(data) + sql);
  if (newDataHash === dataHash.value) return;

  dataHash.value = newDataHash;

  const { dimensions, measures, pivots, table_calculations } = fields;
  const queryMetadata = {
    dimensions: dimensions?.map(d => ({ field: d.name, label: d.label, description: d.description })),
    measures: measures?.map(d => ({ field: d.name, label: d.label, description: d.description })),
    pivots,
    tableCalculations: table_calculations
  };

  console.log("Query re-run. New Viz config and query: ", vizConfig)

  sendMessage(
    queryMetadata,
    extractNestedValuesGenerator(data),
    visConfig.prompt ?? 'summarize',
    visConfig.temperature ?? 0.2,
    visConfig.query ?? ''
  );
});

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
  <div class="container" v-if="!loading && vizConfig">
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

.container {
  height: 100%;
  width: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
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