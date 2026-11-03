import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const docs = path.join(root, 'docs');
const targets = ['FINAL_TECHNICAL_REPORT.md', 'ingestion-specification.md', 'ui-ux-design-system.md', 'ingestion', 'analytics', 'advisor'];
const files = [];
async function visit(file) {
  const info = await fs.stat(file);
  if (info.isDirectory()) for (const child of await fs.readdir(file)) await visit(path.join(file, child));
  else if (file.endsWith('.md')) files.push(file);
}
for (const target of targets) await visit(path.join(docs, target));
const errors = [];
let links = 0;
for (const file of files) {
  const content = await fs.readFile(file, 'utf8');
  for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    links++;
    try { await fs.access(path.resolve(path.dirname(file), decodeURIComponent(target))); }
    catch { errors.push(`${path.relative(root, file)}: missing ${target}`); }
  }
}
const metric = JSON.parse(await fs.readFile(path.join(docs, 'analytics/measurements/lighthouse-2026-11-03.json'), 'utf8'));
if (metric.results.length !== 2) errors.push('Expected two recorded Lighthouse configurations');
for (const run of metric.results) for (const value of Object.values(run.scores)) {
  if (typeof value !== 'number' || value < 0 || value > 1) errors.push('Invalid audit category score');
}
const slides = JSON.parse(await fs.readFile(path.join(docs, 'advisor/presentation/slides.json'), 'utf8'));
if (slides.length !== 11 || slides.some((slide) => !slide.title || !slide.notes)) errors.push('Slide content/notes incomplete');
await fs.access(path.join(docs, 'advisor/presentation/majormatch-defense.pptx'));
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Verified ${files.length} Markdown documents, ${links} local links, 2 Lighthouse runs and 11 slide definitions. PPTX package is verified separately by the presentation finalizer.`);
