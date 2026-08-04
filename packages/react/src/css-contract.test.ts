import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/* —— 全库 CSS 静态契约:三类真实事故的回归红线(jsdom 不解析 CSS,静态扫源文件)。 ——
 * 1) position-area 非法关键字:裸 `span-inline` / `span-block` 不在语法里(整跨轴是 `span-all`),
 *    浏览器会把整条声明作废 → 浮层落到 (0,0) 左上角(Tooltip/Popover/HoverCard 曾全中招)。
 * 2) 自定义属性自引用:`--_x: var(--src, var(--_x))` 是循环依赖 → guaranteed-invalid →
 *    消费属性解析为 initial(Flex 曾因此 ≥48rem 桌面端 direction/gap 全失效)。
 * 3) 绝对定位只锚内联轴、块轴放任 auto:块轴走 shrink-to-fit 塌成内容高度,
 *    里头再按 `inset-block: X 0` 撑的子元素会算出负高度、被钳成 0 → 整个视觉件消失
 *    (Timeline 的 alternate 中轴曾因此全程不可见)。 */

const componentsDir = join(process.cwd(), 'packages/react/src/components');
const extraFiles = [join(process.cwd(), 'packages/react/src/reveal/reveal.css')];

function collectCss(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectCss(full));
    else if (entry.endsWith('.css')) out.push(full);
  }
  return out;
}

const cssFiles = [...collectCss(componentsDir), ...extraFiles];

describe('CSS 静态契约(全组件)', () => {
  it('收集到组件 CSS 文件', () => {
    expect(cssFiles.length).toBeGreaterThan(50);
  });

  it('position-area 不含非法的裸 span-inline / span-block(整跨轴必须写 span-all)', () => {
    const bad: string[] = [];
    for (const file of cssFiles) {
      const text = readFileSync(file, 'utf8');
      for (const [i, line] of text.split('\n').entries()) {
        if (/span-(inline|block)(?![a-z-])/.test(line)) {
          bad.push(`${file.split('/components/')[1] ?? file}:${i + 1}: ${line.trim()}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('绝对定位锚了内联轴就必须锚块轴(只锚内联轴时块高塌成内容高,内部连线/轨道会被钳成 0)', () => {
    // 豁免:确实要停在静态块位置的,在规则块里写一行 /* ms-contract: static-block-ok 理由 */。
    // 用锚点定位(position-area / inset-area)的浮层由锚点给位置,天然豁免。
    const INLINE_ANCHOR = /inset-inline|\bleft:|\bright:|inline-size:/;
    const BLOCK_ANCHOR = /inset-block|inset:|\btop:|\bbottom:|block-size:/;
    const bad: string[] = [];
    for (const file of cssFiles) {
      const text = readFileSync(file, 'utf8');
      // 只匹配最内层规则块(@media / @container 的块体含大括号,自然被跳过)
      for (const m of text.matchAll(/\{([^{}]*)\}/g)) {
        const body = m[1] ?? '';
        if (!/position:\s*absolute/.test(body)) continue;
        if (/position-area|inset-area|ms-contract:\s*static-block-ok/.test(body)) continue;
        if (INLINE_ANCHOR.test(body) && !BLOCK_ANCHOR.test(body)) {
          const line = text.slice(0, m.index).split('\n').length;
          bad.push(`${file.split('/components/')[1] ?? file}:${line}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('自定义属性无同名自引用(--x: … var(--x) 是循环依赖,变量会 guaranteed-invalid)', () => {
    const bad: string[] = [];
    for (const file of cssFiles) {
      const text = readFileSync(file, 'utf8');
      for (const [i, line] of text.split('\n').entries()) {
        const m = line.match(/^\s*(--[\w-]+)\s*:(.*)$/);
        if (m?.[2]?.includes(`var(${m[1]})`) || m?.[2]?.includes(`var(${m[1]},`)) {
          bad.push(`${file.split('/components/')[1] ?? file}:${i + 1}: ${line.trim()}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
