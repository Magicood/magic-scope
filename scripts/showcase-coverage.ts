/**
 * 展示站演示覆盖率报告。
 * 对每个组件:对比「自动抽取的真实 props」与「demo 源码 + 控件旋钮里实际用到的」,
 * 列出尚未在演示中体现的 props —— 组件会话补完新能力后,跑这个就知道要补哪些 demo。
 * 用法:tsx scripts/showcase-coverage.ts
 * 退出码恒为 0(报告性质,不阻断;要当 CI 闸再加阈值)。
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REG = 'playground/showcase/registry';
const DEMOS = 'playground/showcase/adapters/react/demos';
const PROPS = 'playground/showcase/generated/props.json';

interface PropRow {
  name: string;
}
const props: Record<string, PropRow[]> = JSON.parse(readFileSync(PROPS, 'utf8'));

// 噪声 props:不该单独做 demo(props 表已展示)。
// - 通用:className/style/id/name/ref/key/children/aria-*/data-*
// - 多态:as/asChild
// - 受控态:open/defaultOpen(demo 本就受控)
// - 回调:on* 事件处理器
// - 逃生口:*ClassName / *Props(透传)
const NOISE =
  /^(className|classNames|style|id|name|ref|key|children|as|asChild|open|defaultOpen)$|^(aria-|data-|on[A-Z]|render[A-Z])|(ClassName|ClassNames|Props)$/;

function metaInfo(id: string) {
  const txt = readFileSync(join(REG, `${id}.meta.ts`), 'utf8');
  const name = /name:\s*'([^']+)'/.exec(txt)?.[1] ?? id;
  const propsName = /propsName:\s*'([^']+)'/.exec(txt)?.[1];
  const alsoRaw = /alsoProps:\s*\[([^\]]*)\]/.exec(txt)?.[1] ?? '';
  const also = [...alsoRaw.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const controlProps = [...txt.matchAll(/prop:\s*'([^']+)'/g)].map((m) => m[1]);
  return { name, propsName, also, controlProps };
}

const ids = readdirSync(REG)
  .filter((f) => f.endsWith('.meta.ts'))
  .map((f) => f.replace('.meta.ts', ''));

interface Row {
  id: string;
  total: number;
  covered: number;
  uncovered: string[];
}
const report: Row[] = [];

for (const id of ids) {
  const { name, propsName, also, controlProps } = metaInfo(id);
  const keys = [propsName ?? name, ...also];
  const allProps = keys
    .flatMap((k) => (props[k] ?? []).map((p) => p.name))
    .filter((n) => n !== '...props' && !NOISE.test(n));

  const demoDir = join(DEMOS, id);
  const demoText = existsSync(demoDir)
    ? readdirSync(demoDir)
        .filter((f) => f.endsWith('.tsx'))
        .map((f) => readFileSync(join(demoDir, f), 'utf8'))
        .join('\n')
    : '';

  const covered = new Set(controlProps);
  for (const p of allProps) {
    const safe = p.replace(/[^a-zA-Z0-9]/g, '');
    if (safe && new RegExp(`\\b${safe}\\b`).test(demoText)) covered.add(p);
  }
  const uncovered = [...new Set(allProps)].filter((p) => !covered.has(p));
  report.push({ id, total: allProps.length, covered: allProps.length - uncovered.length, uncovered });
}

report.sort((a, b) => b.uncovered.length - a.uncovered.length);

let totalUncovered = 0;
console.log('—— 展示站演示覆盖率(未在 demo/控件中体现的 props)——');
for (const r of report) {
  totalUncovered += r.uncovered.length;
  if (r.uncovered.length > 0) {
    console.log(`  ${r.id.padEnd(14)} ${r.covered}/${r.total}  未演示: ${r.uncovered.join(', ')}`);
  }
}
const fullyCovered = report.filter((r) => r.uncovered.length === 0).length;
console.log(
  `\n${ids.length} 个组件:${fullyCovered} 个全覆盖;共 ${totalUncovered} 个 props 待补 demo。`,
);
