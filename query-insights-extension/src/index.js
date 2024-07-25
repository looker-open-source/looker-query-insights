// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
  const updatedTileData = ref()
  
  // extension setup && viz config data callback
  const extensionSdk = await connectExtensionHost({tileHostDataReceivedCallback: (tileData) => updatedTileData.value = tileData,visualizationDataReceivedCallback: (data) => updatedVizConfig.value = data})

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
  app.provide('tileData', updatedTileData)
  app.mount('#app')
})()
