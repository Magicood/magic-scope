import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCssRules, targetCompound } from './testing/cssRules';

/* —— 全库 CSS 静态契约:六类真实事故的回归红线(jsdom 不解析 CSS,静态扫源文件)。 ——
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
 * 5) 原生控件依赖宿主 reset:库不能假设使用方页面有 CSS reset。<button>/<input> 等自带 UA 默认
 *    background(Chrome ButtonFace 灰)/ border / font(不继承页面字体)/ color,库若不显式重置,
 *    在裸宿主页就渲染成灰色药丸 + 系统字体(Button 的 ghost/outline/link 与 Tabs 关闭钮曾中招)。
 * 判据一律走真实 CSS 解析(见 ./testing/cssRules):正则切块会在注释里的大括号、
 * 字符串里的 `}`、原生嵌套三处静默失效,红线漏报比没有红线更糟。
 * 6) 竖线盒块轴坍缩:只在内联轴给了尺寸的盒子,却靠内联轴边框画竖线,而全文件没有任何一条声明
 *    能给它块轴高度 —— 空元素放进 align-items: center 的 flex 父级不会被拉伸,块高 = 0,
 *    0 高度的边框一个像素都不画(Tree 的 showLine 曾整个 prop 零像素,实测缩进盒 22x0)。 */

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

/* —— 第 6 条红线的工具 —— */

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

/** 把同一目标元素散落在各条规则上的声明并成一份 —— 逐条规则看永远看不出这个 bug:
 *  `.ms-tree__indent` 只写宽、`.ms-tree--line .ms-tree__indent` 只写边框,单看都合法。
 *  归并键与第 3 条红线的 blockAnchored 同源:targetCompound(分支) = 最后一个组合器之后那段。 */
const unionDeclsByTarget = (text: string): Map<string, { prop: string; value: string; line: number }[]> => {
  const byTarget = new Map<string, { prop: string; value: string; line: number }[]>();
  for (const rule of parseCssRules(text)) {
    for (const branch of rule.branches) {
      const key = targetCompound(branch);
      if (!key) continue;
      const decls = byTarget.get(key) ?? [];
      for (const decl of rule.decls) {
        if (decl.prop.startsWith('--')) continue;
        decls.push({ prop: decl.prop, value: decl.value, line: rule.line });
      }
      byTarget.set(key, decls);
    }
  }
  return byTarget;
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

  /* 已知盲区(刻意不拦,免得误报压过价值):
   * - `block-size: 100%` 打在 auto 高父级上同样解析成 0(Divider 竖线即属此类),但百分比高度在
   *   父级有确定高度时完全合法,静态判不出父级,拦了就是大面积误报;
   * - 背景渐变画的竖线不在此列 —— 是否需要块轴高度取决于 background-size,静态同样判不准。
   * 这条红线只守「内联轴边框画竖线」这一种,也就是 Tree showLine 踩到的那一种。 */
  it('靠内联轴边框画竖线的盒子必须有块轴高度(空盒块高 0,边框零像素)', () => {
    const bad: string[] = [];
    for (const file of cssFiles) {
      for (const [key, decls] of unionDeclsByTarget(readFileSync(file, 'utf8'))) {
        const hairline = decls.find((d) => INLINE_HAIRLINE.test(d.prop) && paintsLine(d.value));
        if (!hairline) continue;
        if (!decls.some((d) => INLINE_SIZE.test(d.prop))) continue;
        if (decls.some((d) => BLOCK_EXTENT.test(d.prop) && !isZeroLength(d.value))) continue;
        bad.push(
          `${shortName(file)}:${hairline.line}: ${key} 只有内联轴尺寸,块轴撑不起来 → ${hairline.prop} 零像素(补 align-self: stretch 或显式 block-size)`,
        );
      }
    }
    expect(bad).toEqual([]);
  });
});

/* —— 原生控件 UA 默认值契约 ——
 * 做法:从每个组件 TSX 里找出**直接渲染的原生控件**(小写 <button/input/select/textarea/…>),
 * 解析它的 className(字面量 / 模板串 / 同文件内最近的 const 变量),再回到全库 CSS 里确认这些类
 * 的**基态**规则显式声明了 background / border / font / color。视觉隐藏的控件(a11y 用的真实
 * input:opacity:0 / clip-path / 1px 尺寸)自动豁免——UA 底色看不见,无需重置。 */

const REQUIRED: { readonly key: string; readonly re: RegExp }[] = [
  { key: 'background', re: /(^|;|\s)background(-color)?\s*:/ },
  { key: 'border', re: /(^|;|\s)border(-width|-style)?\s*:/ },
  { key: 'font', re: /(^|;|\s)font(-family)?\s*:/ },
  { key: 'color', re: /(^|;|\s)color\s*:/ },
];
/** 带状态/条件的选择器不算「基态」——:hover 里给 background 救不了首屏。 */
const STATEFUL =
  /:(hover|focus|focus-visible|focus-within|active|checked|disabled|indeterminate|invalid|placeholder-shown|not\(|is\(|where\(|has\()|\[(data-|aria-)/;
const NATIVE_CONTROL = /<(button|input|select|textarea|progress|meter)(?=[\s/>])/g;

interface CssRule {
  sel: string;
  decls: string;
}

function collectTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectTsx(full));
    else if (entry.endsWith('.tsx') && !entry.endsWith('.test.tsx')) out.push(full);
  }
  return out;
}

const cssRules: CssRule[] = [];
for (const file of cssFiles) {
  const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  // 本库 CSS 不用原生嵌套,最内层 `{}` 即一条规则;@media/@layer 头以 @ 开头,跳过。
  for (const m of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = (m[1] ?? '').trim();
    if (!sel.startsWith('@')) cssRules.push({ sel, decls: m[2] ?? '' });
  }
}

const rulesFor = (cls: string): CssRule[] => {
  const needle = new RegExp(`\\.${cls}(?![\\w-])`);
  return cssRules.filter((r) => needle.test(r.sel));
};
const declaresBase = (cls: string, re: RegExp): boolean =>
  rulesFor(cls).some((r) => !STATEFUL.test(r.sel) && re.test(r.decls));
const isVisuallyHidden = (cls: string): boolean =>
  rulesFor(cls).some(
    (r) =>
      /opacity\s*:\s*0\s*[;}]/.test(r.decls) ||
      /clip-path\s*:/.test(r.decls) ||
      /(inline-size|width)\s*:\s*(1px|0)\s*[;}]/.test(r.decls),
  );

/** 从 JSX 起始标签取属性区(按引号/花括号配对,避开 icon={<Foo/>} 里的 `>`)。 */
function attrRegion(src: string, start: number): string {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === quote && src[i - 1] !== '\\') quote = null;
    } else if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0) return src.slice(start, i);
  }
  return src.slice(start, start + 400);
}

const msTokens = (str: string): string[] => [
  ...[...str.matchAll(/["'`]([^"'`]*)["'`]/g)]
    .flatMap((m) => (m[1] ?? '').split(/\s+/))
    .filter((t) => /^ms-[\w-]+$/.test(t)),
  ...[...str.matchAll(/`ms-[\w-]*/g)].map((m) => m[0].slice(1)),
];

/** className={classes} 这类间接写法:回溯同文件内该标识符**最近的**声明,取其中的 ms-* 字面量。 */
function resolveIdent(src: string, id: string, before: number): string[] {
  const re = new RegExp(`(?:const|let)\\s+${id}\\s*=`, 'g');
  let best: RegExpExecArray | null = null;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    if (m.index >= before) break;
    best = m;
  }
  if (!best) return [];
  const slice = src.slice(best.index, best.index + 1200);
  const stop = slice.search(/\n\s*(const|let|return|function|\}\s*\n)/);
  return msTokens(stop > 0 ? slice.slice(0, stop) : slice);
}

interface ControlSite {
  where: string;
  tag: string;
  classes: string[];
}

const controlSites: ControlSite[] = [];
const unresolved: string[] = [];
for (const file of collectTsx(join(srcDir, 'components'))) {
  const src = readFileSync(file, 'utf8');
  const rel = file.split('/components/')[1] ?? file;
  NATIVE_CONTROL.lastIndex = 0;
  for (let m = NATIVE_CONTROL.exec(src); m; m = NATIVE_CONTROL.exec(src)) {
    const tag = m[1] ?? '';
    const region = attrRegion(src, m.index);
    const where = `${rel}:${src.slice(0, m.index).split('\n').length}`;
    const attr = region.match(/className\s*=\s*(\{[\s\S]*?\}|"[^"]*"|'[^']*')/);
    const expr = attr?.[1];
    if (expr === undefined) {
      // 没写 className:只有整体透传 props 时才可能在外部带类,静态守不住 → 记为待办。
      if (/\{\s*\.\.\.\s*\w+\s*\}/.test(region)) unresolved.push(`${where} <${tag}> 无 className`);
      continue;
    }
    let classes = msTokens(expr);
    if (classes.length === 0) {
      const idents = [...expr.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)]
        .map((x) => x[1] ?? '')
        .filter(
          (x) => !['cx', 'clsx', 'classNames', 'undefined', 'null', 'className', ''].includes(x),
        );
      for (const id of idents) classes.push(...resolveIdent(src, id, m.index));
    }
    classes = [...new Set(classes)];
    if (classes.length === 0) {
      unresolved.push(`${where} <${tag}> className 解析不出 ms-* 类名`);
      continue;
    }
    controlSites.push({ where, tag, classes });
  }
}

describe('原生控件 UA 默认值契约(库不得依赖宿主 CSS reset)', () => {
  it('扫到了原生控件渲染点', () => {
    expect(controlSites.length).toBeGreaterThan(50);
  });

  it('每个原生控件的 className 都能静态解析(解析不出就守不住,请写成字面量类名)', () => {
    expect(unresolved).toEqual([]);
  });

  it('每个可见原生控件都自带 background / border / font / color,不吃 UA 默认值', () => {
    const bad: string[] = [];
    for (const site of controlSites) {
      if (site.classes.some((c) => isVisuallyHidden(c))) continue;
      const missing = REQUIRED.filter(
        ({ re }) => !site.classes.some((c) => declaresBase(c, re)),
      ).map(({ key }) => key);
      if (missing.length > 0) {
        bad.push(`${site.where} <${site.tag}> .${site.classes[0]} 缺 ${missing.join(' / ')}`);
      }
    }
    // 修法:在该类的基态规则里补上(库内约定写法:background: transparent / border: none /
    // font: inherit / color: inherit)。切勿指望使用方页面自带 reset。
    expect(bad).toEqual([]);
  });
});
