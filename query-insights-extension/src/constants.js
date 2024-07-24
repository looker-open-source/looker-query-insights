/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2024 Looker Data Sciences, Inc.
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