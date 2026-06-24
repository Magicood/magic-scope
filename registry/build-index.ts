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
  .map((file) => componentSchema.parse(JSON.parse(readFileSync(file, 'utf8'))))
  .sort((a, b) => a.id.localeCompare(b.id));

const out = join(import.meta.dirname, 'manifest.json');
writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `registry: 扫描到 ${files.length} 个 component.json,校验通过 ${manifest.length} 个 → manifest.json`,
);
