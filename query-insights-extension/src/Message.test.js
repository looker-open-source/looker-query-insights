// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Regression check for markdown HTML sanitization in Message.vue.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parse, compileScript } = require('@vue/compiler-sfc');

const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const chromeBin = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
if (!chromeBin) {
  console.error('No Chrome/Chromium binary found; set CHROME_BIN to run Message.test.js');
  process.exit(1);
}

const sfcPath = process.env.MESSAGE_VUE_PATH || path.join(__dirname, 'Message.vue');
const sfcSource = fs.readFileSync(sfcPath, 'utf8');
const { descriptor } = parse(sfcSource, { filename: 'Message.vue' });
const compiledScript = compileScript(descriptor, {
  id: 'msg-xss-check',
  inlineTemplate: true,
});

const componentCode = compiledScript.content
  .replace(/import\s+\{([^}]+)\}\s+from\s+['"]vue['"];?/g, (_, names) => {
    const mapped = names.replace(/\bas\b/g, ':');
    return `const {${mapped}} = window.Vue;`;
  })
  .replace(/import\s+\{\s*marked\s*\}\s+from\s+['"]marked['"];?/g, 'const { marked } = window.marked;')
  .replace(/export\s+default\s+/, 'window.__MessageComponent = ');

const vueUmd = fs.readFileSync(require.resolve('vue/dist/vue.global.prod.js'), 'utf8');
const markedUmd = fs.readFileSync(path.join(path.dirname(require.resolve('marked')), 'marked.umd.js'), 'utf8');

const inputsJson = JSON.stringify({
  poc: '<img src="x" onerror="if(this.closest(\'.tweet-content\')){window.__XSS_EXEC = true}">',
  mxssAndLinks: [
    '<script>window.__XSS_EXEC = true</script>',
    '<svg onload="window.__XSS_EXEC = true"><style><img src=x onerror="window.__XSS_EXEC = true"></style></svg>',
    '<a href="javascript:window.__XSS_EXEC=true">raw</a> [bad](javascript:window.__XSS_EXEC=true) [good](https://cloud.google.com/looker)',
  ].join('\n\n'),
  md: '```markdown\n**Revenue** grew *12%*.\n\n> Key takeaway',
}).replace(/<\//g, '<\\/');

const html = `<!doctype html><html><body>
<div id="app"></div>
<pre id="results"></pre>
<script>${vueUmd}<\/script>
<script>${markedUmd}<\/script>
<script>${componentCode}<\/script>
<script>
(async () => {
  const { createApp, h, nextTick } = window.Vue;
  const INPUTS = ${inputsJson};
  async function renderCase(msg) {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const app = createApp({
      render: () => h(window.__MessageComponent, { message: msg }),
    });
    app.provide('vizConfig', {
      visConfig: { insightImage: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' },
    });
    app.mount(host);
    await nextTick();
    for (const img of host.querySelectorAll('.tweet-content img')) {
      img.dispatchEvent(new Event('error'));
    }
    const htmlOut = host.querySelector('.tweet-content')?.innerHTML ?? '';
    app.unmount();
    host.remove();
    return htmlOut;
  }

  window.__XSS_EXEC = false;
  const pocHtml = await renderCase(INPUTS.poc);
  const mxssAndLinksHtml = await renderCase(INPUTS.mxssAndLinks);
  let errorCoerced = '';
  let errorThrew = false;
  try {
    errorCoerced = await renderCase(new Error('query failed'));
  } catch (_) {
    errorThrew = true;
  }
  const mdHtml = await renderCase(INPUTS.md);

  document.getElementById('results').textContent = JSON.stringify({
    xssExecuted: window.__XSS_EXEC,
    pocHtml,
    mxssAndLinksHtml,
    errorThrew,
    errorCoerced,
    mdHtml,
  });
})();
<\/script>
</body></html>`;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'msg-xss-'));
const tmpHtml = path.join(tmpDir, 'harness.html');
fs.writeFileSync(tmpHtml, html);

try {
  const dom = execFileSync(
    chromeBin,
    [
      '--headless',
      '--no-sandbox',
      '--no-zygote',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-crash-reporter',
      `--user-data-dir=${path.join(tmpDir, 'profile')}`,
      '--virtual-time-budget=200',
      '--dump-dom',
      `file://${tmpHtml}`,
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15000 }
  );
  const match = dom.match(/<pre id="results">([\s\S]*?)<\/pre>/);
  assert.ok(match && match[1], 'Harness did not produce results JSON');
  const decoded = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  const res = JSON.parse(decoded);

  assert.equal(res.xssExecuted, false, `XSS payload executed! pocHtml=${res.pocHtml}`);
  assert.ok(!res.pocHtml.includes('<img'), `Disallowed <img> survived: ${res.pocHtml}`);
  assert.ok(!res.pocHtml.includes('onerror'), `Event handler survived: ${res.pocHtml}`);
  assert.ok(!res.mxssAndLinksHtml.includes('<script'), `<script> survived: ${res.mxssAndLinksHtml}`);
  assert.ok(!res.mxssAndLinksHtml.includes('<svg'), `<svg> survived: ${res.mxssAndLinksHtml}`);
  assert.ok(!res.mxssAndLinksHtml.includes('javascript:'), `javascript: URI survived: ${res.mxssAndLinksHtml}`);
  assert.ok(res.mxssAndLinksHtml.includes('href="https://cloud.google.com/looker"'), `Safe https link lost: ${res.mxssAndLinksHtml}`);
  assert.equal(res.errorThrew, false, 'Non-string Error prop threw instead of coercing');
  assert.ok(res.errorCoerced.includes('query failed'), `Error text missing: ${res.errorCoerced}`);
  assert.ok(res.mdHtml.includes('<strong>Revenue</strong>'), `Bold markdown broken: ${res.mdHtml}`);
  assert.ok(res.mdHtml.includes('<em>12%</em>'), `Italic markdown broken: ${res.mdHtml}`);
  assert.ok(res.mdHtml.includes('<blockquote>'), `Blockquote markdown broken: ${res.mdHtml}`);
  console.log('PASS: Message.vue XSS & markdown checks passed');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
