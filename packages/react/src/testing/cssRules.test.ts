import { describe, expect, it } from 'vitest';
import { parseCssRules, splitSelectorList, targetCompound } from './cssRules';

/* 解析器是几条 CSS 静态红线的地基 —— 它一旦在某种写法上失灵,红线就静默变成恒真。
 * 这里锁住的四种「毒样本」都是正则版切块真实踩过的坑。 */
describe('parseCssRules 毒样本', () => {
  it('注释里的大括号不打乱切分(.ms-tone-{tone} 这种占位写法仓库里真有)', () => {
    const rules = parseCssRules('.rail { /* tone 走 .ms-tone-{tone} */ position: absolute; }');
    expect(rules).toHaveLength(1);
    expect(rules[0]?.decls.map((d) => d.prop)).toEqual(['position']);
  });

  it('字符串字面量里的 } 不截断规则体', () => {
    const rules = parseCssRules('.rail { content: "}"; position: absolute; inset-inline: 0; }');
    expect(rules[0]?.decls.map((d) => d.prop)).toEqual(['content', 'position', 'inset-inline']);
  });

  it('原生嵌套:外层自身的声明照样采集,内层规则单独成条', () => {
    const rules = parseCssRules('.rail { position: absolute; &:hover { opacity: 1; } }');
    expect(rules.find((r) => r.selector === '.rail')?.decls.map((d) => d.prop)).toEqual([
      'position',
    ]);
    expect(rules.find((r) => r.selector === '&:hover')?.decls[0]?.prop).toBe('opacity');
  });

  it('at-rule 不算样式规则,其内部规则带上 atRules 上下文', () => {
    const rules = parseCssRules('@container (min-width: 32rem) { .n { position: absolute; } }');
    expect(rules).toHaveLength(1);
    expect(rules[0]?.selector).toBe('.n');
    expect(rules[0]?.atRules).toEqual(['@container (min-width: 32rem)']);
  });

  it('选择器列表按顶层逗号拆,:not(a, b) 内部的逗号不拆', () => {
    expect(splitSelectorList('.a:not(.x, .y), .b > .c')).toEqual(['.a:not(.x, .y)', '.b > .c']);
  });

  it('targetCompound 取最后一个复合选择器并剥掉伪类 / 伪元素', () => {
    expect(targetCompound('.a > .b:not(:last-child)::after')).toBe('.b');
    expect(
      targetCompound('.ms-timeline:not(.ms-timeline--reverse) > .ms-timeline__item:last-child'),
    ).toBe('.ms-timeline__item');
  });

  it('行号指向选择器起始行', () => {
    expect(parseCssRules('\n\n.a {\n  color: red;\n}\n')[0]?.line).toBe(3);
  });
});
