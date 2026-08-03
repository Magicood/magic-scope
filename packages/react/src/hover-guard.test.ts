import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * P1 hover 守卫回归(设备适配契约,见 docs/responsive.md):
 * 装饰性 `:hover` 规则必须包进 `@media (hover: hover)`,防止触屏 sticky-hover 回潮。
 *
 * 允许出现在守卫外的 `:hover`:
 * - `[data-ms-fx="off"]` / `[data-ms-motion="off"]` 开头的中和规则(基础规则被守卫后触屏 no-op)
 * - `@media (prefers-reduced-motion: reduce)` 内的降级规则(同为中和)
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
        const neutralizer =
          /^\[data-ms-(?:fx|motion)="off"\]/.test(prelude) ||
          stack.some((p) => p.includes('prefers-reduced-motion')) ||
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
