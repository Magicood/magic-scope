/**
 * 包体积守卫 —— 测关键产物的 gzip 体积,超阈值即失败。
 * 防异常膨胀(误打包 sourcemap / 依赖、CSS 失控);阈值留了增长余量(组件会持续增多),
 * 仅拦截暴涨。零依赖(node:zlib)。用法:pnpm size(需先 pnpm build)。
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = join(import.meta.dirname, '..');

const CHECKS = [
  { label: '@magic-scope/tokens  index.js', file: 'packages/tokens/dist/index.js', limitKb: 3 },
  { label: '@magic-scope/react   index.js', file: 'packages/react/dist/index.js', limitKb: 24 },
  { label: '@magic-scope/react   styles.css', file: 'packages/react/dist/styles.css', limitKb: 20 },
  {
    label: '@magic-scope/tokens  arcane.css',
    file: 'packages/tokens/dist/css/arcane.css',
    limitKb: 4,
  },
];

let failed = false;
for (const c of CHECKS) {
  const gz = gzipSync(readFileSync(join(ROOT, c.file))).length / 1024;
  const ok = gz <= c.limitKb;
  if (!ok) {
    failed = true;
  }
  console.log(`${ok ? '✓' : '✗'} ${c.label}: ${gz.toFixed(1)}KB gz (上限 ${c.limitKb}KB)`);
}

if (failed) {
  console.error(
    '\n✗ 体积超限。若为合理增长,调高 scripts/check-size.ts 的 limitKb;否则排查膨胀源。',
  );
  process.exit(1);
}
console.log('\n✓ 体积守卫通过');
