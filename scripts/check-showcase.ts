/**
 * 展示站 CI 红线校验(配合 extract-props.ts --check 一起在 CI 跑):
 *  1. 每个 registry/<id>.meta.ts 必须有配套 adapters/react/<id>.tsx + 至少一个真实 demo 文件。
 *  2. demo 全是真实 .tsx 文件(代码即运行物);本脚本保证「有 meta 必有真实 demo」,
 *     杜绝"只有说明没代码 / 手写示例漂移"。
 * 用法:tsx scripts/check-showcase.ts
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const REG = 'playground/showcase/registry';
const ADP = 'playground/showcase/adapters/react';
const DEMOS = join(ADP, 'demos');

const metas = readdirSync(REG)
  .filter((f) => f.endsWith('.meta.ts'))
  .map((f) => f.replace('.meta.ts', ''));

const problems: string[] = [];
let demoTotal = 0;
for (const id of metas) {
  if (!existsSync(join(ADP, `${id}.tsx`))) {
    problems.push(`${id}:缺 adapter(adapters/react/${id}.tsx)`);
  }
  const demoDir = join(DEMOS, id);
  const demoFiles = existsSync(demoDir)
    ? readdirSync(demoDir).filter((f) => f.endsWith('.tsx'))
    : [];
  demoTotal += demoFiles.length;
  if (demoFiles.length === 0) {
    problems.push(`${id}:缺真实 demo 文件(adapters/react/demos/${id}/*.tsx)`);
  }
}

if (problems.length > 0) {
  console.error('✖ 展示站完整性校验失败(CI 红线):');
  for (const p of problems) {
    console.error(`  - ${p}`);
  }
  process.exit(1);
}

console.log(
  `✓ 展示站完整性 OK:${metas.length} 个组件均有 adapter + 真实 demo(共 ${demoTotal} 个 demo 文件)`,
);
