import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/* —— 全库 CSS 静态契约:三类真实事故的回归红线(jsdom 不解析 CSS,静态扫源文件)。 ——
 * 1) position-area 非法关键字:裸 `span-inline` / `span-block` 不在语法里(整跨轴是 `span-all`),
 *    浏览器会把整条声明作废 → 浮层落到 (0,0) 左上角(Tooltip/Popover/HoverCard 曾全中招)。
 * 2) 自定义属性自引用:`--_x: var(--src, var(--_x))` 是循环依赖 → guaranteed-invalid →
 *    消费属性解析为 initial(Flex 曾因此 ≥48rem 桌面端 direction/gap 全失效)。
 * 3) 竖线盒块轴坍缩:只在内联轴给了尺寸的盒子,却靠内联轴边框画竖线,而全文件没有任何一条声明
 *    能给它块轴高度 —— 空元素放进 align-items: center 的 flex 父级不会被拉伸,块高 = 0,
 *    0 高度的边框一个像素都不画(Tree 的 showLine 曾整个 prop 零像素,实测缩进盒 22x0)。 */

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

/* —— 第 3 条红线的工具 —— */

/** 只靠块轴高度才有可见面积的「内联轴细线」画法。
 *  不含 border 简写(0 高盒子的上下边框仍会画出矩形),也不含 border-block-*(那是横线,靠宽度)。 */
const INLINE_HAIRLINE =
  /^(border-inline-start|border-inline-end|border-inline|border-left|border-right)$/;
/** 内联轴显式尺寸 = 作者把这个盒子当「一条竖轨 / 一段缩进」在用的签名 */
const INLINE_SIZE = /^(inline-size|width|min-inline-size|min-width)$/;
/** 能给块轴高度、或说明它压根不是空盒的声明,命中任意一条即豁免 */
const BLOCK_EXTENT =
  /^(block-size|height|min-block-size|min-height|aspect-ratio|align-self|position|inset|inset-block|inset-block-start|inset-block-end|top|bottom|padding|padding-block|padding-block-start|padding-block-end|padding-top|padding-bottom|content|display|line-height|font-size|align-items|justify-content|grid-row|grid-area)$/;

/** `block-size: 0` 之类的零值不算「有高度」—— 否则一句 height: 0 就能把这条红线静默解除 */
const isZeroLength = (value: string): boolean => /^0([a-z%]*)$/.test(value.trim());
const paintsLine = (value: string): boolean =>
  !/\bnone\b/.test(value) && !/^0\b/.test(value.trim());

/** 取选择器最后一个 compound 的「元素类名」:剥掉伪类括号与 --修饰符,伪元素单独成键。
 *  `.ms-tree--line .ms-tree__indent` 与 `.ms-tree__indent` 因此归到同一个键。 */
const terminalClass = (selector: string): string | null => {
  let flat = selector;
  while (/\([^()]*\)/.test(flat)) flat = flat.replace(/\([^()]*\)/g, '');
  const compound =
    flat
      .trim()
      .split(/[\s>+~]+/)
      .pop() ?? '';
  const pseudoEl = compound.match(/::([-\w]+)/)?.[1];
  const classes = [...compound.replace(/::?[-\w]+/g, '').matchAll(/\.([-\w]+)/g)].map((m) => m[1]);
  const owner = classes.find((c) => c && !c.includes('--')) ?? classes[classes.length - 1];
  if (!owner) return null;
  return `.${owner.replace(/--.*$/, '')}${pseudoEl ? `::${pseudoEl}` : ''}`;
};

type CssDecl = { prop: string; value: string; line: number };

/** 把同一元素散落在各条规则上的声明并成一份 —— 逐条规则看永远看不出这个 bug:
 *  `.ms-tree__indent` 只写宽、`.ms-tree--line .ms-tree__indent` 只写边框,单看都合法。 */
const unionDeclsByElement = (text: string): Map<string, CssDecl[]> => {
  const src = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const byElement = new Map<string, CssDecl[]>();
  for (const block of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, prelude = '', body = ''] = block;
    if (prelude.trimStart().startsWith('@')) continue;
    const line = src.slice(0, block.index).split('\n').length;
    for (const sel of prelude.split(',')) {
      const key = terminalClass(sel);
      if (!key) continue;
      const decls = byElement.get(key) ?? [];
      for (const decl of body.split(';')) {
        const i = decl.indexOf(':');
        if (i < 0) continue;
        const prop = decl.slice(0, i).trim();
        const value = decl.slice(i + 1).trim();
        if (!prop || prop.startsWith('--')) continue;
        decls.push({ prop, value, line });
      }
      byElement.set(key, decls);
    }
  }
  return byElement;
};

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

  /* 已知盲区(刻意不拦,免得误报压过价值):
   * - `block-size: 100%` 打在 auto 高父级上同样解析成 0(Divider 竖线即属此类),但百分比高度在
   *   父级有确定高度时完全合法,静态判不出父级,拦了就是大面积误报;
   * - 背景渐变画的竖线不在此列 —— 是否需要块轴高度取决于 background-size,静态同样判不准。
   * 这条红线只守「内联轴边框画竖线」这一种,也就是 Tree showLine 踩到的那一种。 */
  it('靠内联轴边框画竖线的盒子必须有块轴高度(空盒块高 0,边框零像素)', () => {
    const bad: string[] = [];
    for (const file of cssFiles) {
      for (const [key, decls] of unionDeclsByElement(readFileSync(file, 'utf8'))) {
        const hairline = decls.find((d) => INLINE_HAIRLINE.test(d.prop) && paintsLine(d.value));
        if (!hairline) continue;
        if (!decls.some((d) => INLINE_SIZE.test(d.prop))) continue;
        if (decls.some((d) => BLOCK_EXTENT.test(d.prop) && !isZeroLength(d.value))) continue;
        bad.push(
          `${file.split('/components/')[1] ?? file}:${hairline.line}: ${key} 只有内联轴尺寸,块轴撑不起来 → ${hairline.prop} 零像素(补 align-self: stretch 或显式 block-size)`,
        );
      }
    }
    expect(bad).toEqual([]);
  });
});
