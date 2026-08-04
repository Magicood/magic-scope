import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * P1 hover 守卫回归(设备适配契约,见 docs/responsive.md):
 * 装饰性 `:hover` 规则必须包进 `@media (hover: hover)`,防止触屏 sticky-hover 回潮。
 *
 * 允许出现在守卫外的 `:hover`:
 * - `[data-ms-fx="off"]` / `[data-ms-motion="off"]` 开头且**声明体全为中和值**(none/0/initial…)
 *   的规则——基础规则被守卫后触屏 no-op;若 fx/motion-off 的 hover 分支绘制可见样式
 *   (如替换投影/保留导轨),它自身就是 sticky-hover 源,必须照常进守卫
 * - `@media (prefers-reduced-motion: reduce)` 内声明体全为中和值的降级规则(限定 reduce;
 *   no-preference 是「渐进增强动效」块,里面的 :hover 恰恰最需要守卫)
 * - `:not(:hover)`(glow-hover 静息态,触屏恒成立即「从不发光」,语义正确)
 * - FUNCTIONAL_HOVER_ALLOWLIST 显式登记的功能性 hover(逐条给出理由)
 *
 * 新组件若需装饰性 hover,请直接写进 `@media (hover: hover)`;
 * 若确属功能性(悬停承载必要交互而非视觉反馈),在下方 allowlist 登记并注明理由。
 */

/** 功能性 hover 白名单:文件名 → 允许的选择器片段(含理由)。 */
const FUNCTIONAL_HOVER_ALLOWLIST: Record<string, string[]> = {
  // 悬停暂停滚动是功能而非装饰;触屏 tap 粘滞暂停是可接受的替代交互
  'Marquee.css': ['.ms-marquee--pause-hover:hover'],
};

const SRC_DIR = fileURLToPath(new URL('.', import.meta.url));

function collectCssFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...collectCssFiles(p));
    else if (name.endsWith('.css')) out.push(p);
  }
  return out;
}

/** 去注释(保留换行,便于报错时给出行号)。 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/** 中和值:声明整体不产生新可见绘制(none / 0 / 初始值 / 近零时长)。 */
const NEUTRAL_VALUE = /^(none|initial|inherit|unset|transparent|0(\.\d+)?(px|rem|em|ms|s)?)$/i;

/** 时序类属性:只控制过渡/动画的节奏,任何取值都不绘制内容。
    注意 animation / animation-name 不在此列(hover 挂起可见动画不是中和)。 */
const NEUTRAL_PROP =
  /^(transition(-[a-z]+)?|animation-(duration|delay|iteration-count|timing-function|play-state|fill-mode|direction))$/i;

/** 声明体全为中和声明时才算「中和规则」;任何可见绘制(替换投影/导轨/静态位移等)不豁免。 */
function isNeutralBody(body: string): boolean {
  return body
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .every((d) => {
      const colon = d.indexOf(':');
      if (colon <= 0) return false;
      const prop = d.slice(0, colon).trim();
      const value = d.slice(colon + 1).trim();
      return NEUTRAL_PROP.test(prop) || NEUTRAL_VALUE.test(value);
    });
}

interface Violation {
  file: string;
  line: number;
  selector: string;
}

/** 扫描一份 CSS,返回未被 @media (hover: hover) 守卫的 :hover 规则。 */
function findUnguardedHover(file: string): Violation[] {
  const css = stripComments(readFileSync(file, 'utf8'));
  const fileName = file.split('/').pop() ?? file;
  const allow = FUNCTIONAL_HOVER_ALLOWLIST[fileName] ?? [];

  const violations: Violation[] = [];
  const stack: string[] = []; // 嵌套块的 prelude 栈(@media / @container / @supports / 规则)
  let start = 0;

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      const prelude = css.slice(start, i).trim().replace(/\s+/g, ' ');
      if (!prelude.startsWith('@') && prelude.includes(':hover')) {
        const guarded = stack.some((p) => p.startsWith('@media') && /hover:\s*hover/.test(p));
        const body = css.slice(i + 1, css.indexOf('}', i));
        const isOffPrefix = /^\[data-ms-(?:fx|motion)="off"\]/.test(prelude);
        const inReduce = stack.some((p) => /prefers-reduced-motion:\s*reduce/.test(p));
        const neutralizer =
          // fx/motion-off 与 reduced-motion 的降级规则:声明体必须全为中和值;
          // 若用「静态替换值」呈现 hover(仍是可见绘制),照常要求进守卫
          ((isOffPrefix || inReduce) && isNeutralBody(body)) ||
          // 选择器里的 :hover 全部以 :not(:hover) 形式出现
          prelude.split(':hover').length === prelude.split(':not(:hover)').length;
        const allowed = allow.some((sel) => prelude.includes(sel));
        if (!guarded && !neutralizer && !allowed) {
          violations.push({
            file: fileName,
            line: css.slice(0, start).split('\n').length,
            selector: prelude,
          });
        }
      }
      stack.push(prelude);
      start = i + 1;
    } else if (ch === '}') {
      stack.pop();
      start = i + 1;
    } else if (ch === ';') {
      start = i + 1;
    }
  }
  return violations;
}

describe('设备适配 P1:装饰性 :hover 必须在 @media (hover: hover) 守卫内', () => {
  it('全组件 CSS 无守卫外的装饰性 :hover 规则', () => {
    const files = collectCssFiles(SRC_DIR);
    expect(files.length).toBeGreaterThan(50); // 防扫描落空(路径挪动时暴露)

    const violations = files.flatMap(findUnguardedHover);
    const report = violations.map((v) => `${v.file}:${v.line} → ${v.selector}`).join('\n');
    expect(
      violations,
      `发现守卫外的装饰性 :hover(装饰性请包守卫,功能性请登记 allowlist):\n${report}`,
    ).toEqual([]);
  });
});
