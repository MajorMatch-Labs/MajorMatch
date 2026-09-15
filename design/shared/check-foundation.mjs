import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const modules = ['ingestion', 'analytics', 'advisor'];
const walk = p => fs.readdirSync(p, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(p, e.name)) : [path.join(p, e.name)]);
let links = 0;
for (const module of modules) {
  for (const rel of [`tasks/${module}/prd-${module}-ui.md`, `design/${module}/README.md`, `docs/ai-evidence/${module}/w4-prompt-log.md`]) {
    if (!fs.existsSync(path.join(root, rel))) throw Error('Missing ' + rel);
  }
}
for (const area of ['tasks', 'design', 'docs/ai-evidence']) {
  for (const old of ['van-hoang', 'anh-vy', 'long-nhat']) {
    const p = path.join(root, area, old);
    if (fs.existsSync(p) && walk(p).length) throw Error('Old populated folder: ' + p);
  }
}
for (const file of [...walk(path.join(root, 'tasks')), ...walk(path.join(root, 'design')), path.join(root, 'DESIGN.md'), path.join(root, 'DESIGN-GUARDRAILS.md')].filter(f => f.endsWith('.md'))) {
  const body = fs.readFileSync(file, 'utf8');
  for (const [, url] of body.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|#)/.test(url)) continue;
    const target = path.resolve(path.dirname(file), decodeURIComponent(url.split('#')[0]));
    if (!fs.existsSync(target)) throw Error('Broken link: ' + file + ' -> ' + url);
    links++;
  }
}
console.log('PASS: module artifacts and ' + links + ' local Markdown links');
