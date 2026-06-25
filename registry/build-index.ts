/**
 * 建索引:递归扫描 packages 下所有 component.json → 用 componentSchema 校验 → 写 registry/manifest.json。
 * files 为唯一真相源,manifest.json 为生成物(供文档站 / 前台查询)。
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { componentSchema } from './component.schema';

const ROOT = join(import.meta.dirname, '..');
const PACKAGES = join(ROOT, 'packages');

function findComponentJson(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findComponentJson(full, out);
    } else if (entry.name === 'component.json') {
      out.push(full);
    }
  }
  return out;
}

const files = findComponentJson(PACKAGES);
const manifest = files
  .map((file) => {
    const parsed = componentSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
    if (!parsed.success) {
      const rel = file.replace(`${ROOT}/`, '');
      const issues = parsed.error.issues
        .map((i) => `    · ${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('\n');
      throw new Error(`component.json 校验失败 — ${rel}\n${issues}`);
    }
    return parsed.data;
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const out = join(import.meta.dirname, 'manifest.json');
writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`);

// —— 溯源质量画像(可见性,不阻断构建)——
const byType = { original: 0, inspired: 0, captured: 0 };
const suspectTemplate: string[] = [];
for (const c of manifest) {
  byType[c.source.type] += 1;
  const req = c.source.requirements;
  // 疑似模板:用「。。」拼接,或直接把 description 全文塞进 requirements。
  if (req.includes('。。') || req.includes(c.description)) {
    suspectTemplate.push(c.id);
  }
}

console.log(
  `registry: 扫描到 ${files.length} 个 component.json,校验通过 ${manifest.length} 个 → manifest.json`,
);
console.log(
  `  溯源构成:original ${byType.original} · inspired ${byType.inspired} · captured ${byType.captured}`,
);
if (suspectTemplate.length > 0) {
  console.warn(
    `  ⚠ ${suspectTemplate.length} 个组件的 requirements 疑似模板 / 与 description 雷同,建议补真实需求原文:\n    ${suspectTemplate.join(', ')}`,
  );
}
