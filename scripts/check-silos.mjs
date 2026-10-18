// Hub-and-spoke silo check. Only links in a post's body text count (everything before "## Resources");
// menus, hub cards, and related lists are navigation and never satisfy these rules.
// Scheduled posts count as published, so a pillar link is in place before the spoke's publish date.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { readContent } from './lib/content.mjs';

const MIN_INBOUND = 2;
const plan = JSON.parse(await readFile('data/interlinking-plan.json', 'utf8'));
const dir = 'content/posts';
const posts = new Map();
for (const file of (await readdir(dir)).filter(name => name.endsWith('.md'))) {
  const { metadata, body } = await readContent(path.join(dir, file));
  if (metadata.draft === true) continue;
  const text = body.split(/^##\s+Resources\s*$/m)[0];
  const links = new Set([...text.matchAll(/(?<!!)\[[^\]]+\]\((\/[^)#?\s]+\/?)(?:#[^)]+)?\)/g)].map(match => match[1]));
  posts.set(metadata.slug, { file, links });
}

const failures = [];
const inbound = new Map([...posts.keys()].map(slug => [slug, []]));
for (const [slug, post] of posts) for (const target of post.links) if (target !== slug && inbound.has(target)) inbound.get(target).push(slug);
for (const record of plan) {
  const post = posts.get(record.url_slug);
  if (!post) continue;
  const hub = record.primary_silo_hub;
  if (record.silo_role === 'Hub') {
    for (const spoke of plan) if (spoke.primary_silo_hub === hub && spoke.url_slug !== hub && posts.has(spoke.url_slug) && !post.links.has(spoke.url_slug)) failures.push(`${post.file}: pillar has no body link down to its spoke ${spoke.url_slug}`);
  } else if (posts.has(hub) && !post.links.has(hub)) failures.push(`${post.file}: spoke has no body link up to its pillar ${hub}`);
  const count = inbound.get(record.url_slug).length;
  if (count < MIN_INBOUND) failures.push(`${post.file}: ${count} inbound body link(s) from other posts; minimum is ${MIN_INBOUND}`);
}
for (const slug of posts.keys()) if (!plan.some(record => record.url_slug === slug)) failures.push(`${posts.get(slug).file}: post has no silo record in data/interlinking-plan.json`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Silo interlinking passed for ${posts.size} published and scheduled posts.`);
