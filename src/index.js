/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {
  connectExtensionHost,
  LookerExtensionSDK40,
} from '@looker/extension-sdk'
import './index.css'
import App from './App.vue'
import Home from './views/Home.vue'
import LLM from './views/LLM.vue'
import { createApp } from 'vue'
import { createMemoryHistory, createWebHistory, createRouter } from 'vue-router'
import VueDraggableResizable from 'vue-draggable-resizable'

;(async () => {
  const routes = [
    { path: '/', component: Home },
    { path: '/erd-to-lookml', component: LLM }
  ]

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

  const extensionSdk = await connectExtensionHost()
  const sdk = LookerExtensionSDK40.createClient(extensionSdk)
  const root = document.createElement('div')
  root.id = "app"
  root.style.height = '100%'
  root.style.width = '100%'
  root.style.position = 'fixed'
  document.body.appendChild(root)
  const app = createApp(App, {extensionSdk, sdk})
  app.use(router)
  app.component("vue-draggable-resizable", VueDraggableResizable)
  app.mount('#app')
})()
