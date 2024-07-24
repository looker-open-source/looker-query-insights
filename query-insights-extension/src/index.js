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
import { createApp, ref } from 'vue'

;(async () => {
  // monitor viz config change
  const updatedVizConfig = ref()
  
  // extension setup && viz config data callback
  const extensionSdk = await connectExtensionHost({visualizationDataReceivedCallback: (data) => updatedVizConfig.value = data})
  const sdk = LookerExtensionSDK40.createClient(extensionSdk)
  
  // create and style root element
  const root = document.createElement('div')
  root.id = "app"
  root.style.height = '100%'
  root.style.width = '100%'
  root.style.display = 'flex'
  root.style.justifyContent = 'center'
  root.style.alignItems = 'center'
  document.body.appendChild(root)
  const app = createApp(App)
  
  // provide globally to all components via inject()
  app.provide('sdk',sdk)
  app.provide('extensionSdk',extensionSdk)
  app.provide('vizConfig',updatedVizConfig)
  app.mount('#app')
})()
