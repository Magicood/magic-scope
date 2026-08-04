/* —— 测试专用:极简 CSS 规则解析器(不随包发布,tsup entry 只有 index.ts + styles.css)。 ——
 * 为什么不用正则:CSS 静态红线一旦用 `/\{([^{}]*)\}/` 这类正则切块,会在四处静默失效 ——
 * 注释里的大括号(`.ms-tone-{tone}`)、字符串里的 `}`(content: "}")、嵌套规则(`&:hover`)
 * 会让整条规则扫不到;而 `[^{]*` 能跨越逗号与换行,导致「选择器 A 里出现过某字符串」
 * 被误当成「规则 B 里有该条件」。红线漏报比没有红线更糟(给的是虚假安全感),故老实解析。 */

export interface CssDecl {
  /** 属性名,小写去空白(如 `inset-block-start`、`--ms-tl-gap`)。 */
  prop: string;
  /** 属性值,原样去首尾空白。 */
  value: string;
}

export interface CssRule {
  /** 完整选择器列表原文(可能含逗号与换行)。 */
  selector: string;
  /** 逗号拆开、各自去空白的选择器分支。 */
  branches: string[];
  /** 该规则自身的声明(不含嵌套子规则里的)。 */
  decls: CssDecl[];
  /** 选择器起始行号(1 起)。 */
  line: number;
  /** 所在 at-rule 前奏栈(如 ['@container (min-width: 32rem)'])。 */
  atRules: string[];
}

/**
 * 把一份 CSS 源码解析成扁平的样式规则列表(嵌套规则、at-rule 内的规则都会各自成条)。
 * 处理:注释、字符串字面量、at-rule、CSS 原生嵌套。不处理:@import 展开、变量求值。
 */
export function parseCssRules(source: string): CssRule[] {
  // 注释抹成等长空白:既避免注释里的大括号 / 分号干扰切分,又保住行号不漂。
  const css = source.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const out: CssRule[] = [];
  const stack: { prelude: string; line: number; decls: CssDecl[]; isAt: boolean }[] = [];
  let buf = '';
  let bufLine = 1;
  let line = 1;

  const pushDecl = () => {
    const text = buf.trim();
    buf = '';
    if (!text) return;
    const colon = text.indexOf(':');
    if (colon <= 0) return;
    const frame = stack[stack.length - 1];
    if (!frame) return;
    frame.decls.push({
      prop: text.slice(0, colon).trim().toLowerCase(),
      value: text.slice(colon + 1).trim(),
    });
  };

  for (let i = 0; i < css.length; i++) {
    const ch = css[i] ?? '';
    if (ch === '\n') line++;

    // 字符串字面量整体跳过(content: "}" 之类不该影响切分)
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < css.length && css[j] !== quote) {
        if (css[j] === '\\') j++;
        if (css[j] === '\n') line++;
        j++;
      }
      buf += css.slice(i, j + 1);
      i = j;
      continue;
    }

    if (ch === '{') {
      const prelude = buf.trim();
      stack.push({ prelude, line: bufLine, decls: [], isAt: prelude.startsWith('@') });
      buf = '';
      continue;
    }
    if (ch === '}') {
      pushDecl();
      const frame = stack.pop();
      if (frame && !frame.isAt && frame.prelude) {
        out.push({
          selector: frame.prelude,
          branches: splitSelectorList(frame.prelude),
          decls: frame.decls,
          line: frame.line,
          atRules: stack.filter((f) => f.isAt).map((f) => f.prelude),
        });
      }
      continue;
    }
    if (ch === ';') {
      pushDecl();
      continue;
    }
    if (!buf.trim() && ch.trim()) bufLine = line;
    buf += ch;
  }
  return out;
}

/** 按顶层逗号拆选择器列表(不拆 :not(a, b) 这类括号内的逗号)。 */
export function splitSelectorList(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of selector) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts.map((p) => p.replace(/\s+/g, ' '));
}

/**
 * 取一个选择器分支的「目标复合选择器」= 最后一个组合器之后的那段(伪类/伪元素已剥掉)。
 * `.a > .b:not(:last-child)::after` → `.b`
 */
export function targetCompound(branch: string): string {
  const last =
    branch
      .split(/\s*[>+~]\s*|\s+/)
      .filter(Boolean)
      .pop() ?? '';
  // 剥伪类 / 伪元素(含其括号参数)
  let out = '';
  let depth = 0;
  for (let i = 0; i < last.length; i++) {
    const ch = last[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      continue;
    }
    if (depth > 0) continue;
    if (ch === ':') {
      // 跳到本伪类结束(下一个 : 或 . 或 [ 之前),其括号已由 depth 吞掉
      let j = i + 1;
      let d = 0;
      while (j < last.length) {
        if (last[j] === '(') d++;
        else if (last[j] === ')') d--;
        else if (d === 0 && (last[j] === '.' || last[j] === '[' || last[j] === ':')) break;
        j++;
      }
      i = j - 1;
      continue;
    }
    out += ch;
  }
  return out;
}
