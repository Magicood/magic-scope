import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/* —— 全库 CSS 静态契约:三类真实事故的回归红线(jsdom 不解析 CSS,静态扫源文件)。 ——
 * 1) position-area 非法关键字:裸 `span-inline` / `span-block` 不在语法里(整跨轴是 `span-all`),
 *    浏览器会把整条声明作废 → 浮层落到 (0,0) 左上角(Tooltip/Popover/HoverCard 曾全中招)。
 * 2) 自定义属性自引用:`--_x: var(--src, var(--_x))` 是循环依赖 → guaranteed-invalid →
 *    消费属性解析为 initial(Flex 曾因此 ≥48rem 桌面端 direction/gap 全失效)。
 * 3) 原生控件依赖宿主 reset:库不能假设使用方页面有 CSS reset。<button>/<input> 等自带 UA 默认
 *    background(Chrome ButtonFace 灰)/ border / font(不继承页面字体)/ color,库若不显式重置,
 *    在裸宿主页就渲染成灰色药丸 + 系统字体(Button 的 ghost/outline/link 与 Tabs 关闭钮曾中招)。 */

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
for (const file of collectTsx(componentsDir)) {
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
