/**
 * 包体积守卫 —— 测关键产物的 gzip 体积,超阈值即失败。
 * 防异常膨胀(误打包 sourcemap / 依赖、CSS 失控);阈值留了增长余量(组件会持续增多),
 * 仅拦截暴涨。零依赖(node:zlib)。用法:pnpm size(需先 pnpm build)。
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = join(import.meta.dirname, '..');

// 注:react 的两条阈值在 v1「54 组件全深度」落地时上调过(barrel ≈73KB gz / styles ≈36KB gz)。
// barrel 是全量入口,库本身 tree-shakeable(sideEffects 已标),用户按需 import 远小于此;
// 阈值留 ~20% 余量给后续组件增长,仅拦截「误打包依赖 / CSS 失控」级别的暴涨。
const CHECKS = [
  { label: '@magic-scope/tokens  index.js', file: 'packages/tokens/dist/index.js', limitKb: 3 },
  { label: '@magic-scope/react   index.js', file: 'packages/react/dist/index.js', limitKb: 90 },
  { label: '@magic-scope/react   styles.css', file: 'packages/react/dist/styles.css', limitKb: 45 },
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
