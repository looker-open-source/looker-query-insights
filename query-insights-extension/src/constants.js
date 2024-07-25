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

export const vizConfigSettings = {
    temperature: {
        type: "number",
        label: "1. Set Model Temperature",
        display: "number",
        default: 0.2,
        required: true,
        section: 'LLM'
    },
    prompt: {
        type: "string",
        label: "2. Set Prompt Type",
        values: [{ Summary: "summarize" }, { Forecast: "predict" }],
        display: "radio",
        default: "summarize",
        required: true,
        section: 'LLM'
    },
    query: {
        type: "string",
        label: "3. Set Query Description / Context",
        display: "text",
        required: false,
        section: 'LLM'
    },
    themeColor: {
      order: 1,
      type: "array",
      label: "Configure Theme Color",
      display: "colors",
      section: "Display"
    },
    backgroundColor: {
        type: "array",
        label: "Configure Background Color",
        display: "color",
        section: "Display"
    },
    cardColor: {
      type: "array",
      label: "Configure Card Color",
      display: "color",
      section: "Display"
    },
    headerColor: {
        type: "array",
        label: "Configure Header Color",
        display: "color",
        section: "Display"
    },
    textColor: {
      type: "array",
      label: "Configure Text Color",
      display: "color",
      section: "Display"
    },
    shadowColor: {
      type: "array",
      label: "Configure Shadow Color",
      display: "color",
      section: "Display"
    },
    insightImage: {
      type: "string",
      label: "Image URL",
      default: "https://img.icons8.com/ios/50/light-on--v1.png",
      section: "Display"
    }
  }