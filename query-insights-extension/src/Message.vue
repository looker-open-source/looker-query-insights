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
import { defineProps, inject, ref } from 'vue';
import { marked } from "marked";

const props = defineProps(['message'])
const vizConfig = inject('vizConfig')
const isActive = ref(false)

const ALLOWED_TAGS = new Set([
  'P', 'BR', 'HR', 'STRONG', 'B', 'EM', 'I', 'DEL', 'CODE', 'PRE',
  'BLOCKQUOTE', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'A',
]);

// ponytail: DOMParser tag allowlist avoids adding a dependency; switch to DOMPurify if rich HTML/SVG output is ever needed
function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const clean = (node) => {
    if (node.nodeType === 3) return doc.createTextNode(node.textContent);
    if (node.nodeType !== 1 || node.namespaceURI !== 'http://www.w3.org/1999/xhtml') return null;
    if (!ALLOWED_TAGS.has(node.tagName)) return null;
    const el = doc.createElement(node.tagName.toLowerCase());
    if (node.tagName === 'A') {
      const href = node.getAttribute('href');
      if (href) {
        try {
          const dummyBase = 'http://relative-base';
          const url = new URL(href, dummyBase);
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            const isRelative = url.origin === dummyBase;
            el.setAttribute('href', isRelative ? href : url.href);
            el.setAttribute('rel', 'noopener noreferrer');
            el.setAttribute('target', '_blank');
          }
        } catch (_) {}
      }
    }
    for (const child of Array.from(node.childNodes)) {
      const copy = clean(child);
      if (copy) el.appendChild(copy);
    }
    return el;
  };
  const out = doc.createElement('div');
  for (const child of Array.from(doc.body.childNodes)) {
    const copy = clean(child);
    if (copy) out.appendChild(copy);
  }
  return out.innerHTML;
}

const renderMessage = (msg) =>
  sanitizeHtml(marked.parse(String(msg).replace(/^```markdown\n/, '')));

</script>

<template>
  <div class="tweet-container" :class="{ hover_shadow: isActive}" @mouseover="isActive = true" @mouseout="isActive = false">
    <div v-if="vizConfig.visConfig !== undefined" class="icon-container">
        <img width="18vw" height="20vh" :src="vizConfig.visConfig.insightImage ?? 'https://img.icons8.com/ios/50/light-on--v1.png'" alt="light-on--v1"/>
    </div>
    <div v-if="props.message" class="tweet-content" v-html="renderMessage(props.message)"></div>
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