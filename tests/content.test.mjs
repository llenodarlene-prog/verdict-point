import test from 'node:test'; import assert from 'node:assert/strict'; import { markdownToHtml } from '../scripts/lib/content.mjs';
test('markdown renderer escapes raw HTML',()=>assert.match(markdownToHtml('<script>alert(1)</script>'),/&lt;script&gt;/));
test('markdown renderer creates headings and links',()=>{const html=markdownToHtml('# Title\n\n[About](/about/)');assert.match(html,/<h1>Title<\/h1>/);assert.match(html,/href="\/about\/"/)});
