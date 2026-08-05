import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { type CssRule as ParsedCssRule, parseCssRules, targetCompound } from './testing/cssRules';

/* —— 全库 CSS 静态契约:八类真实事故的回归红线(jsdom 不解析 CSS,静态扫源文件)。 ——
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
 *    0 高度的边框一个像素都不画(Tree 的 showLine 曾整个 prop 零像素,实测缩进盒 22x0)。
 * 7) 竖线盒把百分比块高当唯一高度来源:`block-size: 100%` 要父级块高确定才解析得出,父级 auto 高
 *    (普通块级流 / auto 高 flex 行)时退化成 auto ⇒ 空盒块高 0;更坑的是百分比是 definite
 *    cross size,会**压制 flex 的 stretch**,连 align-items: stretch 都救不回来
 *    (Divider 的 orientation="vertical" 实测六种父级只有「祖先定高」那两种画得出线)。
 * 8) 绝对定位靠 translate 沿某轴位移,却不锚该轴的 inset:元素落在**静态位置**,而静态位置随父级
 *    padding / border 浮动,JS 喂进来的偏移量(offsetLeft / rect 差)基准却是 padding box ⇒
 *    父级一有内边距就整体错位(Tabs 的 pill 指示条实测两轴恒偏 +4px = list 的 padding 双算;
 *    Anchor 墨条同型潜伏,消费方给根加 padding / border 即错位)。 */

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

/* —— 第 7 条红线的工具 —— */

/** 块轴尺寸属性 */
const BLOCK_SIZE_PROP = /^(block-size|height)$/;
/** 内联轴尺寸「退化成一条线」的签名 —— 盒子本身零宽,可见的只有那条边框(Divider 竖线即此形态)。
 *  刻意不认 `inline-size: 100%` 之类:那是正常面板,边框只是装饰性描边(Drawer 面板会误报)。 */
const isDegenerateInline = (prop: string, value: string): boolean =>
  /^(inline-size|width)$/.test(prop) && isZeroLength(value);
/** 百分比长度:`100%` / `calc(100% - 2px)` 都算(只要出现百分比就依赖父级确定高度) */
const hasPercent = (value: string): boolean => /\d%/.test(value);
/** 真正「不依赖父级」的块轴地板。
 *  **不含 align-self / aspect-ratio**:两者都会被同时存在的 block-size 压制 ——
 *  `block-size: 100%` 是 definite cross size,写了 align-self: stretch 也不会被拉伸,
 *  把它当豁免就等于给「加了 stretch 就算修好了」这种假修复开后门(实测 stretch 救不回来)。 */
const BLOCK_FLOOR = /^(min-block-size|min-height)$/;
/** 自带确定高度(非百分比、非 auto、非零)也算站得住 */
const isDefiniteBlockSize = (value: string): boolean => {
  const v = value.trim();
  return v !== 'auto' && !hasPercent(v) && !isZeroLength(v);
};

/* —— 第 8 条红线的工具 —— */

/** 位置锚点(**不含**尺寸属性:block-size 能防塌陷,但决定不了元素落在哪) */
const BLOCK_INSETS = new Set([
  'inset',
  'inset-block',
  'inset-block-start',
  'inset-block-end',
  'top',
  'bottom',
]);
const INLINE_INSETS = new Set([
  'inset',
  'inset-inline',
  'inset-inline-start',
  'inset-inline-end',
  'left',
  'right',
]);

/** 只认「外部(JS)喂进来的位移量」= 值里带 var()。
 *  字面量 `translate: -50% -50%` 是拿自身尺寸做的**居中**惯用法,没有外部基准、不可能与锚点错位
 *  (ColorPicker 的 thumb、Checkbox 的触控热区都是这一类,拦了纯属误报)。 */
const movesAxis = (component: string | undefined): boolean =>
  component !== undefined && /\bvar\(/.test(component);

/** 拆函数实参(顶层逗号切分,不进嵌套括号)。 */
const fnArgs = (value: string, start: number): string[] => {
  const args: string[] = [];
  let depth = 0;
  let cur = '';
  for (let i = start; i < value.length; i++) {
    const ch = value[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      if (depth === 0) break;
      depth--;
    }
    if (ch === ',' && depth === 0) {
      args.push(cur);
      cur = '';
    } else cur += ch;
  }
  args.push(cur);
  return args.map((a) => a.trim());
};

/** 一条声明沿哪条**物理**轴产生了位移(transform 的各 translate* 函数 + 独立 translate 属性)。 */
function translatedAxes(prop: string, value: string): { x: boolean; y: boolean } {
  const axes = { x: false, y: false };
  if (prop === 'translate') {
    // `translate: <x> [<y> [<z>]]`,顶层空白切分(不切 calc(…) / var(…) 里的空格)
    const parts: string[] = [];
    let depth = 0;
    let cur = '';
    for (const ch of value) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (/\s/.test(ch) && depth === 0) {
        if (cur) parts.push(cur);
        cur = '';
      } else cur += ch;
    }
    if (cur) parts.push(cur);
    if (movesAxis(parts[0])) axes.x = true;
    if (movesAxis(parts[1])) axes.y = true;
    return axes;
  }
  if (prop !== 'transform') return axes;
  for (const m of value.matchAll(/(^|[^-\w])translate(x|y|3d)?\(/gi)) {
    const kind = (m[2] ?? '').toLowerCase();
    const args = fnArgs(value, (m.index ?? 0) + m[0].length);
    if (kind === 'x') {
      if (movesAxis(args[0])) axes.x = true;
    } else if (kind === 'y') {
      if (movesAxis(args[0])) axes.y = true;
    } else {
      // translate(x[, y]) / translate3d(x, y, z):省略的 y 默认 0
      if (movesAxis(args[0])) axes.x = true;
      if (movesAxis(args[1])) axes.y = true;
    }
  }
  return axes;
}

/** 声明 + 它所在规则的行号(报错要指到具体那一行)。 */
interface LocatedDecl {
  prop: string;
  value: string;
  line: number;
}

/** 把同一目标元素散落在各条规则上的声明并成一份 —— 逐条规则看永远看不出这个 bug:
 *  `.ms-tree__indent` 只写宽、`.ms-tree--line .ms-tree__indent` 只写边框,单看都合法。
 *  归并键与第 3 条红线的 blockAnchored 同源:targetCompound(分支) = 最后一个组合器之后那段。 */
const unionDeclsByTarget = (text: string): Map<string, LocatedDecl[]> => {
  const byTarget = new Map<string, LocatedDecl[]>();
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
     *         —— 用声明而不是注释,注释里随口提一句 position-area 就能静默关掉检查。
     * 与第 8 条的 *_INSETS 刻意不共用:这条防的是「块轴塌成内容高」,写死高度就能防住,
     * 故 block-size / height 在这里算合格锚点;第 8 条防的是「落错位置」,尺寸不管用。 */
    const BLOCK_ANCHORS = new Set([...BLOCK_INSETS, 'block-size', 'height']);
    const INLINE_ANCHORS = INLINE_INSETS;
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
   * 背景渐变画的竖线不在此列 —— 是否需要块轴高度取决于 background-size,静态判不准。
   * 这条红线只守「内联轴边框画竖线」这一种,也就是 Tree showLine 踩到的那一种;
   * 「块高只由百分比提供」那一种由下一条(第 7 条)单独守。 */
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

  it('零宽细线盒必须有不依赖父级的块轴地板(百分比高与 align-self: stretch 都靠不住)', () => {
    /* 与上一条同源、互补:上一条守「一整类竖轨盒有没有块轴高度」,这一条只盯**零宽细线盒**
     * (inline-size: 0 + 内联轴边框 —— 盒子本身没有内容,能看见的就那一条边框),对它要求更硬:
     * 高度必须来自**元素自己**,不能寄望父级。三种「看着像修好了、实则没修」的写法都拦:
     * ① `block-size: 100%` —— 百分比要父级块高确定才解析得出,父级 auto 高时退化成 auto ⇒ 0 高;
     * ② `block-size: 100%` + `align-self: stretch` —— 百分比是 definite cross size,**压制
     *    stretch**,加了也白加(实测六种父级仍只有祖先定高的画得出线);
     * ③ `block-size: auto` + `align-self: stretch` 但没地板 —— 有 flex/grid 行时对,
     *    可纯行内流(`左<hr>右` 这种最常见的行内分隔)里没得 stretch,仍是 0 高。
     * 合格写法 = min-block-size / min-height 地板,或一个确定长度的 block-size。
     * 签名收得紧(零宽 + 内联轴边框 + 非绝对定位),换来全库零误报:
     * - `inline-size: 100%` 的面板不算(边框只是装饰描边,否则 Drawer 面板会误报);
     * - 绝对 / 固定定位不算(包含块尺寸恒确定,百分比一定解析得出)。 */
    const bad: string[] = [];
    for (const file of cssFiles) {
      for (const [key, decls] of unionDeclsByTarget(readFileSync(file, 'utf8'))) {
        const hairline = decls.find((d) => INLINE_HAIRLINE.test(d.prop) && paintsLine(d.value));
        if (!hairline) continue;
        if (!decls.some((d) => isDegenerateInline(d.prop, d.value))) continue;
        if (decls.some((d) => d.prop === 'position' && /absolute|fixed/.test(d.value))) continue;
        if (decls.some((d) => BLOCK_FLOOR.test(d.prop) && !isZeroLength(d.value))) continue;
        if (decls.some((d) => BLOCK_SIZE_PROP.test(d.prop) && isDefiniteBlockSize(d.value))) {
          continue;
        }
        const height = decls.find((d) => BLOCK_SIZE_PROP.test(d.prop));
        bad.push(
          `${shortName(file)}:${height?.line ?? hairline.line}: ${key} 是零宽细线盒,块高${
            height ? `只有 ${height.prop}: ${height.value}` : '压根没写'
          } —— 百分比要父级定高才解析得出、且会压制 flex stretch;auto + stretch 在纯行内流里同样是 0(补 min-block-size 地板)`,
        );
      }
    }
    expect(bad).toEqual([]);
  });

  it('绝对定位沿某轴 translate 位移时,该轴必须显式锚 inset(否则落在随父级 padding 浮动的静态位置)', () => {
    /* JS 驱动的指示器一律是「abspos + 变量喂位移量」。位移量的基准是 offsetLeft / rect 差,
     * 也就是**包含块的 padding box**;而该轴不写 inset 时元素停在**静态位置**,
     * 静态位置又落在父级的 **content box** ——两者差着父级的 padding(+ border),于是恒定错位。
     * 判据按**声明该位移的那条规则自身**(或同选择器 / 该目标的基础规则)是否锚了同轴,
     * 不做「同目标跨规则合并」——否则竖排变体的 inset-inline 会把横排变体的缺口盖掉(实测会漏报)。
     * 豁免:确实要停在静态位置的,在规则里加一行 `--ms-contract-static-translate: <理由>;`。 */
    const bad: string[] = [];
    for (const file of cssFiles) {
      const rules = parseCssRules(readFileSync(file, 'utf8'));
      /** 该目标的「基础规则」(选择器就是目标复合体本身)里锚过的轴 —— 这类规则必然一起生效 */
      const baseAnchors = new Map<string, Set<string>>();
      /** 同一条选择器分支(含祖先段)锚过的轴 */
      const branchAnchors = new Map<string, Set<string>>();
      const anchoredProps = (rule: ParsedCssRule): string[] =>
        rule.decls.filter((d) => d.value.trim() !== 'auto').map((d) => d.prop);
      for (const rule of rules) {
        for (const branch of rule.branches) {
          const props = anchoredProps(rule);
          const into = (map: Map<string, Set<string>>, key: string) => {
            const set = map.get(key) ?? new Set<string>();
            for (const p of props) set.add(p);
            map.set(key, set);
          };
          into(branchAnchors, branch);
          if (branch === targetCompound(branch)) into(baseAnchors, branch);
        }
      }
      // position: absolute 可能写在基础规则里、位移写在修饰规则里 → 按目标合并「是否绝对定位」
      const absolute = new Set<string>();
      for (const rule of rules) {
        if (rule.decls.find((d) => d.prop === 'position')?.value !== 'absolute') continue;
        for (const branch of rule.branches) absolute.add(targetCompound(branch));
      }
      for (const rule of rules) {
        if (rule.decls.some((d) => d.prop === '--ms-contract-static-translate')) continue;
        for (const decl of rule.decls) {
          const axes = translatedAxes(decl.prop, decl.value);
          if (!axes.x && !axes.y) continue;
          for (const branch of rule.branches) {
            const target = targetCompound(branch);
            if (!absolute.has(target)) continue;
            const seen = new Set([
              ...(branchAnchors.get(branch) ?? []),
              ...(baseAnchors.get(target) ?? []),
            ]);
            if (axes.x && ![...seen].some((p) => INLINE_INSETS.has(p))) {
              bad.push(
                `${shortName(file)}:${rule.line}: ${branch} 沿内联轴位移却没锚 inset-inline-*`,
              );
            }
            if (axes.y && ![...seen].some((p) => BLOCK_INSETS.has(p))) {
              bad.push(`${shortName(file)}:${rule.line}: ${branch} 沿块轴位移却没锚 inset-block-*`);
            }
          }
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

/* —— 孤儿 CSS 类契约:CSS 里写了、库却从不渲染的类 = 永不生效的死规则 ——
 * 事故原型:FloatButton 的 `.ms-float-button-group__group-trigger` —— TSX 渲染的其实是
 * `ms-float-button__group-trigger`(block 名多写了一层 `-group`),整条规则从未生效。后果不是
 * 「少了点样式」:触发钮的 `order: 2` 退回初始值 0,排到了子项面板**前面**,speed-dial 四个
 * direction 的展开方向**全部倒置**,贴锚点边的还从触发钮变成了子项面板(位置随子项数量漂移)。
 * 类名拼错既不报错也不告警,CSS 那段代码看着一切正常,jsdom 更是连 CSS 都不解析。
 *
 * 判据:全库 CSS 选择器里出现的每个 `.ms-*` 类,都要在仓库源码 / 文档里找得到渲染方。证据两种:
 *   ① 精确字面量 —— `'ms-tabs__tab'`、`class="ms-card"`;
 *   ② 模板前缀 —— `ms-tabs--${variant}` / `ms-tone-${tone}` 这类拼接,取被 `${` 截断的字面
 *      前缀做前缀匹配。前缀必须以 `-` / `_` 收尾(BEM 的天然断点)且 `ms-` 之后还有 ≥2 字符,
 *      否则放行面宽到能废掉整条红线 —— 仓库里真有裸 `ms-` 前缀的写法:upload demo 的
 *      `` `ms-${file.name}` ``(拼的是**文件名**)和 scripts/new-component.ts 的代码生成模板
 *      `` `.ms-${kebab}` ``。放它们进来,1344 个类会被一次性全部放行,红线只剩个绿勾。
 *      收窄的代价是漏识别的动态类名会**误报**成孤儿 —— 误报有人看,假绿没人看,这个方向是对的。
 *
 * 两处刻意排除,都是「同形但不是使用证据」:
 *   - `--ms-*` 自定义属性与类名同形,`--ms-space-3` 不是 `.ms-space-3` 的渲染方(负向后顾排除);
 *   - `*.test.*` / `*.spec.*`:测试里断言类名不等于组件渲染它,而且不排除的话,本文件注释里
 *     随手提一句类名就会把它「洗白」成有证据 —— 红线给自己发豁免,最典型的假绿。
 *
 * 豁免:确实要留给使用方自己挂的纯 hook 类,在规则里加一行 `--ms-contract-css-only: <理由>;`
 *      —— 与第 3 条红线同源,用声明而不是注释(注释里提一句类名就能静默关掉检查)。 */

const repoRoot = process.cwd();
/** 会渲染 / 记录类名的地方:发布包、展示站、样板站、文档、注册表、生成器。 */
const CONSUMER_DIRS = ['packages', 'playground', 'apps', 'docs', 'registry', 'scripts'];
const CONSUMER_EXTS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.vue',
  '.md',
  '.html',
  '.json',
];
const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git', '.claude', '.turbo']);
const IS_TEST_FILE = /\.(test|spec)\.[jt]sx?$/;

function collectConsumer(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out; // 目录不存在(如未生成 docs)不该让红线炸,只是证据面小一点
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectConsumer(full, out);
    else if (CONSUMER_EXTS.some((ext) => entry.endsWith(ext)) && !IS_TEST_FILE.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const consumerFiles = CONSUMER_DIRS.flatMap((d) => collectConsumer(join(repoRoot, d)));

/** 类名字面量。负向后顾把 `--ms-x`(自定义属性)挡在外面。 */
const CLASS_TOKEN = /(?<![\w-])ms-[\w-]+/g;
/** 被 `${` 截断的模板前缀:`` `ms-tabs--${variant}` `` → `ms-tabs--`。 */
const CLASS_PREFIX = /(?<![\w-])(ms-[\w-]*)(?=\$\{)/g;
/** 够窄才配当证据:`ms-` 之后 ≥2 字符,且停在 `-` / `_` 这种 BEM 断点上。 */
const USABLE_PREFIX = /^ms-[\w-]{2,}[-_]$/;

const exactClassTokens = new Set<string>();
const classPrefixes = new Set<string>();
for (const file of consumerFiles) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(CLASS_TOKEN)) exactClassTokens.add(m[0]);
  for (const m of text.matchAll(CLASS_PREFIX)) {
    const prefix = m[1] ?? '';
    if (USABLE_PREFIX.test(prefix)) classPrefixes.add(prefix);
  }
}

/** CSS 里定义的每个 ms-* 类 → 首次出现处;带 `--ms-contract-css-only` 的规则登记为豁免。 */
const cssClassSites = new Map<string, string>();
const cssOnlyClasses = new Set<string>();
for (const file of cssFiles) {
  for (const rule of parseCssRules(readFileSync(file, 'utf8'))) {
    const exempt = rule.decls.some((d) => d.prop === '--ms-contract-css-only');
    for (const branch of rule.branches) {
      for (const m of branch.matchAll(/\.(ms-[\w-]+)/g)) {
        const cls = m[1] ?? '';
        if (exempt) cssOnlyClasses.add(cls);
        if (!cssClassSites.has(cls)) cssClassSites.set(cls, `${shortName(file)}:${rule.line}`);
      }
    }
  }
}

describe('孤儿 CSS 类契约(CSS 里写了、库却从不渲染 = 永不生效的死规则)', () => {
  it('扫到了 CSS 类与消费方文件(任一侧塌了,整条红线就是假绿)', () => {
    expect(cssClassSites.size).toBeGreaterThan(1000);
    expect(consumerFiles.length).toBeGreaterThan(500);
    expect(exactClassTokens.size).toBeGreaterThan(1000);
  });

  it('每个 ms-* 类都有渲染方(找不到 = 类名拼错或规则已废弃,样式静默消失)', () => {
    const orphans: string[] = [];
    for (const [cls, where] of cssClassSites) {
      if (cssOnlyClasses.has(cls)) continue;
      if (exactClassTokens.has(cls)) continue;
      if ([...classPrefixes].some((p) => cls.startsWith(p))) continue;
      orphans.push(`${where}: .${cls} —— 全仓 TSX / TS / 文档里都找不到这个类名`);
    }
    /* 修法三选一:① 类名拼错 —— 对齐 TSX 实际渲染的那个(改 CSS 侧,别改 TSX:TSX 里的类名
     *   已随包发布,是使用方能写覆盖样式的公开契约);② 规则已废弃 —— 连注释一起删掉;
     *   ③ 类名是动态拼的但前缀太宽没被识别 —— 把拼接前缀收窄到 `ms-<组件>-` 这种粒度。 */
    expect(orphans).toEqual([]);
  });
});
