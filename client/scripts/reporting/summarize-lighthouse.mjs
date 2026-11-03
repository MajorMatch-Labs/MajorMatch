import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const [mobilePath, desktopPath, outputDirectory] = process.argv.slice(2);
if (!mobilePath || !desktopPath || !outputDirectory) throw new Error('Usage: node summarize-lighthouse.mjs <mobile.json> <desktop.json> <output-directory>');
const metrics = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'];
const baseline = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const results = [];
for (const [device, source] of [['mobile', mobilePath], ['desktop', desktopPath]]) {
  const raw = await fs.readFile(source);
  const report = JSON.parse(raw);
  if (report.runtimeError) throw new Error(`${device}: ${report.runtimeError.message}`);
  results.push({
    device, lighthouseVersion: report.lighthouseVersion, fetchTime: report.fetchTime,
    requestedUrl: report.requestedUrl, finalDisplayedUrl: report.finalDisplayedUrl,
    rawReportSha256: createHash('sha256').update(raw).digest('hex'),
    config: { formFactor: report.configSettings.formFactor, screenEmulation: report.configSettings.screenEmulation, throttlingMethod: report.configSettings.throttlingMethod, throttling: report.configSettings.throttling },
    environment: { hostUserAgent: report.environment.hostUserAgent, benchmarkIndex: report.environment.benchmarkIndex },
    scores: Object.fromEntries(Object.entries(report.categories).map(([key, category]) => [key, category.score])),
    metrics: Object.fromEntries(metrics.map((key) => [key, { value: report.audits[key]?.numericValue, unit: report.audits[key]?.numericUnit, display: report.audits[key]?.displayValue }])),
    failedAudits: Object.entries(report.audits).filter(([, audit]) => audit.score === 0).map(([id, audit]) => ({ id, title: audit.title, displayValue: audit.displayValue })),
    warnings: report.runWarnings ?? [],
  });
}
await fs.mkdir(outputDirectory, { recursive: true });
const output = { baseline, node: process.version, scope: 'Local production home page; anonymous synthetic lab run; one run per configuration; not an EC2 or field measurement', results };
await fs.writeFile(path.join(outputDirectory, 'lighthouse-2026-11-03.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(results.map(({ device, scores, metrics }) => ({ device, scores, metrics })), null, 2));
