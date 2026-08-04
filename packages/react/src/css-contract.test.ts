import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCssRules, targetCompound } from './testing/cssRules';

/* —— 全库 CSS 静态契约:四类真实事故的回归红线(jsdom 不解析 CSS,静态扫源文件)。 ——
 * 1) position-area 非法关键字:裸 `span-inline` / `span-block` 不在语法里(整跨轴是 `span-all`),
 *    浏览器会把整条声明作废 → 浮层落到 (0,0) 左上角(Tooltip/Popover/HoverCard 曾全中招)。
 * 2) 自定义属性自引用:`--_x: var(--src, var(--_x))` 是循环依赖 → guaranteed-invalid →
 *    消费属性解析为 initial(Flex 曾因此 ≥48rem 桌面端 direction/gap 全失效)。
 * 3) 绝对定位只锚内联轴、块轴放任 auto:块轴走 shrink-to-fit 塌成内容高度,
 *    里头再按 `inset-block: X 0` 撑的子元素会算出负高度、被钳成 0 → 整个视觉件消失
 *    (Timeline 的 alternate 中轴曾因此全程不可见)。
 * 4) 长度属性的 math function 里写裸数字:`max(0, var(--len))` 的 `0` 是 <number> 不是 <length>,
 *    类型不一致 → 整条声明在计算期作废(实测计算值退回 0px,等同没写)
 *    (Timeline 的触屏最小热区曾因此一直是死的)。
 * 判据一律走真实 CSS 解析(见 ./testing/cssRules):正则切块会在注释里的大括号、
 * 字符串里的 `}`、原生嵌套三处静默失效,红线漏报比没有红线更糟。 */

/* 扫 packages/react/src 下**全部** .css:靠手工维护 extraFiles 会让新增的顶层样式表默认漏检。 */
const srcDir = join(process.cwd(), 'packages/react/src');

function collectCss(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectCss(full));
    else if (entry.endsWith('.css')) out.push(full);
  }
  return out;
}

const cssFiles = collectCss(srcDir);
const shortName = (file: string) => file.slice(srcDir.length + 1);

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
    /* 判据按**属性名**精确匹配,不做子串匹配 —— `border-top` / `min-block-size: 0` 都不是块轴锚点,
     * `min-inline-size: 0`(解 flex 溢出的标准写法,全库上百处)也不是内联轴锚点。
     * `inline-size` 是尺寸不是锚点,故不计入:`position: absolute; inline-size: 100%` + 静态块位置
     * 是合法写法(满宽装饰下划线),不该被逼着写豁免。
     * 豁免:① position-area / inset-area 由锚点定位给位置;
     *      ② 同一目标元素在**本文件其它规则**里锚了块轴(基础规则 + 修饰规则是本库主流写法,
     *         如 .ms-tour__card 的 inset-block-start 写在 .ms-tour--bottom 那些修饰规则里);
     *      ③ 确实要停在静态块位置的,在规则里加一行声明 `--ms-contract-static-block: <理由>;`
     *         —— 用声明而不是注释,注释里随口提一句 position-area 就能静默关掉检查。 */
    const BLOCK_ANCHORS = new Set([
      'inset',
      'inset-block',
      'inset-block-start',
      'inset-block-end',
      'top',
      'bottom',
      'block-size',
      'height',
    ]);
    const INLINE_ANCHORS = new Set([
      'inset',
      'inset-inline',
      'inset-inline-start',
      'inset-inline-end',
      'left',
      'right',
    ]);
    const bad: string[] = [];
    for (const file of cssFiles) {
      const rules = parseCssRules(readFileSync(file, 'utf8'));
      // 本文件里每个目标元素在**所有**规则中拿到过的块轴锚点(基础规则 + 修饰规则合并看)
      const blockAnchored = new Set<string>();
      for (const rule of rules) {
        if (!rule.decls.some((d) => BLOCK_ANCHORS.has(d.prop))) continue;
        for (const branch of rule.branches) blockAnchored.add(targetCompound(branch));
      }
      for (const rule of rules) {
        const props = new Set(rule.decls.map((d) => d.prop));
        if (rule.decls.find((d) => d.prop === 'position')?.value !== 'absolute') continue;
        if (props.has('position-area') || props.has('inset-area')) continue;
        if (props.has('--ms-contract-static-block')) continue;
        const inlineDecl = rule.decls.find((d) => INLINE_ANCHORS.has(d.prop));
        if (!inlineDecl) continue;
        if (rule.decls.some((d) => BLOCK_ANCHORS.has(d.prop))) continue;
        if (rule.branches.every((b) => blockAnchored.has(targetCompound(b)))) continue;
        bad.push(
          `${shortName(file)}:${rule.line}: ${rule.selector} —— ${inlineDecl.prop} 无块轴对位`,
        );
      }
    }
    expect(bad).toEqual([]);
  });

  it('长度属性的 min/max/clamp 里不得出现裸数字(裸 0 是 <number>,类型不一致会让整条声明作废)', () => {
    /* `max(0, var(--ms-target-min))` 里的 `0` 在 math function 内部是 <number> 而非 <length>,
     * 与 <length> 混用类型不一致 → 整个 math function 无效 → **整条声明在解析期被丢弃**。
     * 这类错误静默失效、jsdom 测不出:Timeline 的触屏最小热区曾因此一直是死的。
     * 正确写法见 Result.css 的 `max(0px, var(--ms-target-min))`。
     * 注意只查 min/max/clamp:`minmax(0, 1fr)` 是 grid 函数,裸 0 在那里合法。 */
    const LENGTH_PROP =
      /^(min-|max-)?(block-size|inline-size|width|height)$|^(inset|top|right|bottom|left|margin|padding|gap|row-gap|column-gap|border-radius|font-size|flex-basis)(-|$)/;
    const topArgs = (s: string): string[] => {
      const out: string[] = [];
      let depth = 0;
      let cur = '';
      for (const ch of s) {
        if (ch === '(') depth++;
        if (ch === ')') {
          if (depth === 0) break;
          depth--;
        }
        if (ch === ',' && depth === 0) {
          out.push(cur.trim());
          cur = '';
        } else cur += ch;
      }
      if (cur.trim()) out.push(cur.trim());
      return out;
    };
    const bad: string[] = [];
    for (const file of cssFiles) {
      for (const rule of parseCssRules(readFileSync(file, 'utf8'))) {
        for (const decl of rule.decls) {
          if (!LENGTH_PROP.test(decl.prop)) continue;
          // 前面不能是标识符字符,免得把 minmax( 当成 max(
          for (const fn of decl.value.matchAll(/(^|[^-\w])(min|max|clamp)\(/g)) {
            const args = topArgs(decl.value.slice((fn.index ?? 0) + fn[0].length));
            const bareNumbers = args.filter((a) => /^-?\d*\.?\d+$/.test(a));
            if (bareNumbers.length) {
              bad.push(`${shortName(file)}:${rule.line}: ${decl.prop}: ${decl.value}`);
            }
          }
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
