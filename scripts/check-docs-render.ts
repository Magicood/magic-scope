/**
 * docs 渲染红线:校验 pnpm gen:docs 产物的结构完整性 + docs:build 产物的渲染纯净度。
 * 结构检查(docs/components/*.md):H1/展示站链接/参数/溯源/兼容性备注/预览 include/表格列数。
 * 渲染检查(docs/.vitepress/dist):实体二次转义、花括号拆分、残留 \| 等「构建能过但肉眼是坏的」缺陷
 * (真实案例:`string[]` 在 code span 里被实体化成 string&#91;] 外显、{{ 拆成「{ {」、
 *  --ms-xxx-* 成对星号被 markdown 当强调符吞掉 —— 死链校验与 Vue 编译都拦不住这些)。
 * 在 CI 中于 docs:build 之后运行;previews/ 是手写部件,只查生成段落不查预览内容。
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const DOCS = join(ROOT, 'docs');
const OUT_DIR = join(DOCS, 'components');
const DIST = join(DOCS, '.vitepress', 'dist');

interface ManifestEntry {
  id: string;
  source: { capturedAt: string; notes?: string };
}
const manifest = JSON.parse(
  readFileSync(join(ROOT, 'registry', 'manifest.json'), 'utf8'),
) as ManifestEntry[];
const byId = new Map(manifest.map((c) => [c.id, c]));

const problems: string[] = [];
const flag = (id: string, msg: string) => problems.push(`  · ${id}: ${msg}`);

// —— ① 生成 md 结构 ——
const pages = readdirSync(OUT_DIR).filter((f) => f.endsWith('.md'));
if (pages.length !== manifest.length) {
  problems.push(`  · 页数 ${pages.length} ≠ manifest ${manifest.length}`);
}
// 表格行的单元数(剥 \| 转义;code span 内的管道符已按 \| 约定转义,无需再剥)。
const cellCount = (line: string) => line.replace(/\\\|/g, '').split('|').length;
for (const f of pages) {
  const id = f.replace('.md', '');
  const md = readFileSync(join(OUT_DIR, f), 'utf8');
  const entry = byId.get(id);
  if (!entry) {
    flag(id, 'manifest 无此 id');
    continue;
  }
  if (!/^# .+ <Badge /m.test(md)) flag(id, '缺 H1 + Badge');
  if (!md.includes(`/magic-scope/#/${id})`)) flag(id, '展示站链接缺失或 id 不符');
  if (!md.includes('## 参数 Props')) flag(id, '缺参数章节');
  if (!md.includes('## 溯源') || !md.includes(entry.source.capturedAt)) flag(id, '溯源章节不完整');
  if (Boolean(entry.source.notes) !== md.includes('## 兼容性备注')) {
    flag(id, 'source.notes 与兼容性备注章节不一致');
  }
  const hasPart = existsSync(join(DOCS, 'previews', `${id}.md`));
  if (hasPart !== md.includes(`<!--@include: ../previews/${id}.md-->`)) {
    flag(id, '预览 include 与 previews/ 部件不一致');
  }
  for (const bad of ['undefined |', '[object Object]', '{ {']) {
    if (md.includes(bad)) flag(id, `可疑内容「${bad}」`);
  }
  const lines = md.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const cur = lines[i];
    const prev = lines[i - 1];
    // 仅比较相邻表行(同一张表内),分隔行(---)跳过。
    if (!cur.startsWith('| ') || !prev.startsWith('| ') || cur.includes('---')) continue;
    const base = prev.includes('---') ? lines[i - 2] : prev;
    if (base?.startsWith('| ') && cellCount(base) !== cellCount(cur)) {
      flag(id, `第 ${i + 1} 行表格列数不齐:${cur.slice(0, 50)}…`);
    }
  }
}

// —— ② 侧栏 / 总览与页数一致 ——
const sidebar = JSON.parse(
  readFileSync(join(DOCS, '.vitepress', 'sidebar.generated.json'), 'utf8'),
) as { text: string; items: { link: string }[] }[];
const sideCount = sidebar.filter((g) => g.text !== '指南').reduce((n, g) => n + g.items.length, 0);
if (sideCount !== pages.length) problems.push(`  · 侧栏组件项 ${sideCount} ≠ 页数 ${pages.length}`);
const indexRows = (readFileSync(join(DOCS, 'index.md'), 'utf8').match(/\| \[/g) ?? []).length;
if (indexRows !== pages.length) problems.push(`  · 总览行 ${indexRows} ≠ 页数 ${pages.length}`);

// —— ③ 构建产物渲染纯净度(需先 docs:build)——
const distPages = join(DIST, 'components');
if (!existsSync(distPages)) {
  problems.push(
    '  · 未找到 docs/.vitepress/dist/components —— 本检查须在 pnpm docs:build 之后运行',
  );
} else {
  const artifacts: [string, string][] = [
    ['&amp;#', '实体二次转义(&#…; 落进了 code span)'],
    ['{ {', '花括号拆分外显'],
    ['\\|', '残留管道转义符'],
    ['<td>undefined</td>', 'undefined 单元格'],
    ['&lt;br&gt;', '<br> 以文本外显'],
  ];
  for (const f of readdirSync(distPages).filter((x) => x.endsWith('.html'))) {
    const html = readFileSync(join(distPages, f), 'utf8');
    for (const [pat, label] of artifacts) {
      if (html.includes(pat)) flag(f.replace('.html', ''), `渲染产物含${label}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`✖ docs 渲染红线:${problems.length} 个问题\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`✓ docs 渲染红线:${pages.length} 页结构与渲染产物全部通过`);
