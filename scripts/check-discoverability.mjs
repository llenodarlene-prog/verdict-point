import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { publishDate } from './lib/schedule.mjs';

async function walk(dir) {
  const entries=await readdir(dir,{withFileTypes:true});
  return (await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();
}
const files=(await walk('dist')).filter(f=>f.endsWith('.html'));
const manifest=JSON.parse(await readFile('dist/build-manifest.json','utf8').catch(()=>'{"pages":[]}'));
const state=new Map((manifest.pages||[]).map(p=>[p.slug||p.route||p.url,{...p}]));
for (const record of state.values()) {
  if (!record.source) continue;
  const raw=await readFile(record.source,'utf8').catch(()=>'');
  if (/^draft:\s*true\s*$/mi.test(raw)) record.draft=true;
  const published=raw.match(/^published:\s*([^\n]*)$/mi)?.[1]?.trim();
  if (published) record.published=published;
}
const pages=[];
for(const file of files){
  const html=await readFile(file,'utf8');
  const rel=path.relative('dist',file).replaceAll(path.sep,'/');
  const route=rel==='index.html'?'/':`/${path.posix.dirname(rel)}/`;
  const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const entities=scripts.flatMap(x=>Array.isArray(x?.['@graph'])?x['@graph']:[x]).filter(Boolean);
  const types=new Set(entities.flatMap(e=>Array.isArray(e['@type'])?e['@type']:[e['@type']]).filter(Boolean));
  const hrefs=[...html.matchAll(/href="(\/[^"#?]*\/?)(?:[#?][^"]*)?"/g)].map(m=>m[1]||'/').map(h=>h==='/'?'/':h.replace(/\/$/,'')+'/');
  const publishedArticle=entities.some(e=>['Article','BlogPosting','NewsArticle'].includes(e['@type'])&&Boolean(e.datePublished));
  pages.push({route,html,types,hrefs,publishedArticle});
}
const routes=new Set(pages.map(p=>p.route));
const inbound=new Map(pages.map(p=>[p.route,0]));
for(const p of pages) for(const href of new Set(p.hrefs)) if(routes.has(href)&&href!==p.route) inbound.set(href,(inbound.get(href)||0)+1);
const failures=[];
for(const page of pages){
  const article=['Article','BlogPosting','NewsArticle'].some(t=>page.types.has(t));
  if(page.route==='/' && (!page.types.has('Organization')||!page.types.has('WebSite'))) failures.push('/: homepage schema requires Organization and WebSite');
  if(article){
    for(const required of ['Organization','WebSite','WebPage','BreadcrumbList']) if(!page.types.has(required)) failures.push(`${page.route}: article schema missing ${required}`);
    if(page.publishedArticle && (inbound.get(page.route)||0)<1) failures.push(`${page.route}: orphaned article has no inbound internal link`);
  }
}
if(failures.length) throw new Error(failures.join('\n'));
console.log(`Discoverability checks passed for ${pages.length} HTML pages.`);
