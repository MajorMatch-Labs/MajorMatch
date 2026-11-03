import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const modules = process.env.ARTIFACT_MODULES;
const skill = process.env.PRESENTATIONS_SKILL;
const python = process.env.ARTIFACT_PYTHON;
if (!modules || !skill || !python) throw new Error('Set ARTIFACT_MODULES, PRESENTATIONS_SKILL and ARTIFACT_PYTHON from the Codex bundled runtime.');
process.env.RUNTIME_NODE_MODULES ??= modules;
const resolve = createRequire(path.join(modules, '__resolve.cjs'));
const { Presentation, PresentationFile } = await import(pathToFileURL(resolve.resolve('@oai/artifact-tool')).href);
const { finalizePresentation } = await import(pathToFileURL(path.join(skill, 'container_tools/artifact_tool_utils.mjs')).href);
const build = path.join(root, '.presentation-build');
const out = path.join(root, 'docs/advisor/presentation');
await fs.mkdir(build, { recursive: true });
await fs.mkdir(out, { recursive: true });
const data = JSON.parse(await fs.readFile(path.join(out, 'slides.json'), 'utf8'));
const metrics = JSON.parse(await fs.readFile(path.join(root, 'docs/analytics/measurements/lighthouse-2026-11-03.json'), 'utf8'));
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const font = 'Segoe UI';
function text(slide, value, x, y, w, h, size = 29, color = '#334155', bold = false) {
  const shape = slide.shapes.add({ geometry: 'textbox', position: { left: x, top: y, width: w, height: h }, fill: 'none', line: { fill: 'none', width: 0 } });
  shape.text = value;
  shape.text.style = { typeface: font, fontSize: size, color, bold, autoFit: 'none', wrap: 'square', insets: 0 };
  return shape;
}
for (const [i, item] of data.entries()) {
  const slide = deck.slides.add();
  slide.background.fill = i === 0 ? '#111827' : '#F8FAFC';
  text(slide, item.title, 76, 62, 1120, i === 0 ? 112 : 116, i === 0 ? 74 : 45, i === 0 ? '#FFFFFF' : '#1E1B4B', true);
  if (i === 0) {
    text(slide, item.subtitle, 80, 225, 1090, 120, 44, '#C7D2FE');
    item.lines.forEach((line, n) => text(slide, line, 82, 455 + n * 54, 1090, 42, 26, '#CBD5E1'));
  } else if (item.diagram) {
    const labels = ['Trình duyệt\nNgười học', 'Web public\nNext.js', 'Gateway\nFastAPI', 'SQLite\nLưu trữ', 'HPC local\nModel AI'];
    const positions = [{ left: 60, top: 292 }, { left: 300, top: 292 }, { left: 550, top: 292 }, { left: 950, top: 205 }, { left: 950, top: 435 }];
    const shapes = labels.map((label, n) => {
      const box = slide.shapes.add({ geometry: 'rect', position: { ...positions[n], width: 210, height: 120 }, fill: n === 2 ? '#4338CA' : '#E0E7FF', line: { fill: '#A5B4FC', width: 1 } });
      box.text = label;
      box.text.style = { typeface: font, fontSize: 27, bold: true, color: n === 2 ? '#FFFFFF' : '#312E81', alignment: 'center', verticalAlignment: 'middle' };
      return box;
    });
    for (const [from, to] of [[0, 1], [1, 2], [2, 3], [2, 4]]) slide.shapes.connect(shapes[from], shapes[to], { kind: 'elbow', fromSide: 'right', toSide: 'left', line: { fill: '#6366F1', width: 2 }, tail: { type: 'triangle' } });
    text(slide, item.lines[3], 80, 585, 1100, 64, 25, '#64748B');
  } else if (item.metrics) {
    metrics.results.forEach((run, n) => {
      const score = Math.round(run.scores.performance * 100);
      text(slide, `${run.device.toUpperCase()}   ${score}/100`, 82 + n * 590, 225, 520, 78, 45, '#4338CA', true);
      text(slide, `LCP ${run.metrics['largest-contentful-paint'].display}\nCLS ${run.metrics['cumulative-layout-shift'].display}\nTBT ${run.metrics['total-blocking-time'].display}`, 84 + n * 590, 324, 520, 155, 29);
    });
    text(slide, item.lines[2], 82, 570, 1110, 72, 25, '#64748B');
  } else {
    item.lines.forEach((line, n) => {
      text(slide, String(n + 1).padStart(2, '0'), 80, 212 + n * 96, 55, 64, 26, '#6366F1', true);
      text(slide, line, 162, 205 + n * 96, 1010, 84, 29);
    });
  }
  text(slide, `${i + 1} / ${data.length}`, 1100, 668, 104, 28, 17, i === 0 ? '#CBD5E1' : '#64748B');
  slide.speakerNotes.text = item.notes;
  const png = await deck.export({ slide, format: 'png', scale: 1 });
  await fs.writeFile(path.join(build, `slide-${String(i + 1).padStart(2, '0')}.png`), new Uint8Array(await png.arrayBuffer()));
}
const candidatePath = path.join(build, 'candidate.pptx');
await (await PresentationFile.exportPptx(deck)).save(candidatePath);
const result = await finalizePresentation({
  workspaceDir: root, candidatePath, finalPath: path.join(out, process.env.PRESENTATION_OUTPUT_NAME || 'majormatch-defense.pptx'),
  pythonExecutable: python,
  integrityValidatorPath: path.join(skill, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skill, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  explicitTotalSlideCount: data.length,
  fontPolicy: { basis: 'design', families: [font] }, verifyArtifactToolImport: true,
  receiptPath: path.join(build, `${process.env.PRESENTATION_OUTPUT_NAME || 'majormatch-defense.pptx'}.validation.json`),
});
console.log(JSON.stringify(result));
