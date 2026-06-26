// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { buildStackVars, normalizeResponsive, resolveResponsiveVars, spaceVar } from './logic';
import { Stack } from './Stack';

describe('Stack/logic', () => {
  it('normalizeResponsive:单值规整为 { base }', () => {
    expect(normalizeResponsive('horizontal')).toEqual({ base: 'horizontal' });
  });

  it('normalizeResponsive:断点对象只保留合法断点键、丢弃未知键', () => {
    const out = normalizeResponsive({ base: 1, md: 4, bogus: 9 } as never);
    expect(out).toEqual({ base: 1, md: 4 });
  });

  it('spaceVar:0 走字面 0,其余引用 token 变量', () => {
    expect(spaceVar(0)).toBe('0');
    expect(spaceVar(4)).toBe('var(--ms-space-4)');
  });

  it('resolveResponsiveVars:base 用短名、断点用带后缀名', () => {
    const vars = resolveResponsiveVars('gap', { base: 2, md: 4 }, spaceVar);
    expect(vars).toEqual({
      '--ms-stack-gap': 'var(--ms-space-2)',
      '--ms-stack-gap-md': 'var(--ms-space-4)',
    });
  });

  it('buildStackVars:方向/对齐/分布解析为 flex 关键字', () => {
    const vars = buildStackVars({
      direction: 'horizontal',
      align: 'center',
      justify: 'between',
      wrap: 'wrap',
    });
    expect(vars['--ms-stack-dir']).toBe('row');
    expect(vars['--ms-stack-align']).toBe('center');
    expect(vars['--ms-stack-justify']).toBe('space-between');
    expect(vars['--ms-stack-wrap']).toBe('wrap');
  });
});

describe('Stack', () => {
  it('默认渲染为 div,带 ms-stack 类与 data-ms-stack 标记;默认方向/间距变量', () => {
    render(<Stack data-testid="s">a</Stack>);
    const el = screen.getByTestId('s');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ms-stack');
    expect(el).toHaveAttribute('data-ms-stack', 'true');
    // 默认 vertical → column,gap 默认档 4
    expect(el.style.getPropertyValue('--ms-stack-dir')).toBe('column');
    expect(el.style.getPropertyValue('--ms-stack-gap')).toBe('var(--ms-space-4)');
  });

  it('断点对象 gap/direction 拍平为 base + 断点变量', () => {
    render(
      <Stack
        data-testid="s"
        direction={{ base: 'vertical', md: 'horizontal' }}
        gap={{ base: 2, lg: 8 }}
      >
        a
      </Stack>,
    );
    const el = screen.getByTestId('s');
    expect(el.style.getPropertyValue('--ms-stack-dir')).toBe('column');
    expect(el.style.getPropertyValue('--ms-stack-dir-md')).toBe('row');
    expect(el.style.getPropertyValue('--ms-stack-gap')).toBe('var(--ms-space-2)');
    expect(el.style.getPropertyValue('--ms-stack-gap-lg')).toBe('var(--ms-space-8)');
  });

  it('inline 切 inline-flex 类', () => {
    render(
      <Stack data-testid="s" inline>
        a
      </Stack>,
    );
    expect(screen.getByTestId('s')).toHaveClass('ms-stack--inline');
  });

  it('divider:在相邻子项间插入分隔(N 项 → N-1 个分隔),且对辅助技术隐藏', () => {
    render(
      <Stack data-testid="s" divider={<i className="dot" />}>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </Stack>,
    );
    const dividers = screen.getByTestId('s').querySelectorAll('.ms-stack__divider');
    expect(dividers).toHaveLength(2);
    for (const d of dividers) expect(d).toHaveAttribute('aria-hidden', 'true');
  });

  it('divider:单个子项不插入分隔', () => {
    render(
      <Stack data-testid="s" divider={<i />}>
        <span>only</span>
      </Stack>,
    );
    expect(screen.getByTestId('s').querySelectorAll('.ms-stack__divider')).toHaveLength(0);
  });

  it('recursive:直接子 Stack 自动取反方向,显式指定方向的子 Stack 不被覆盖', () => {
    render(
      <Stack data-testid="parent" direction="vertical" recursive>
        <Stack data-testid="auto">auto</Stack>
        <Stack data-testid="explicit" direction="vertical">
          explicit
        </Stack>
      </Stack>,
    );
    // 父纵向 → 自动子翻为横向(row)
    expect(screen.getByTestId('auto').style.getPropertyValue('--ms-stack-dir')).toBe('row');
    // 显式纵向子保持 column
    expect(screen.getByTestId('explicit').style.getPropertyValue('--ms-stack-dir')).toBe('column');
  });

  it('多态 as:渲染为指定标签(section)', () => {
    render(
      <Stack as="section" data-testid="s">
        a
      </Stack>,
    );
    expect(screen.getByTestId('s').tagName).toBe('SECTION');
  });

  it('asChild:合并样式/变量到唯一子元素而不额外包 DOM,事件 compose', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Stack asChild gap={2} className="extra">
        <a ref={ref} href="#section-x" data-testid="s">
          前往章节 X
        </a>
      </Stack>,
    );
    const el = screen.getByTestId('s');
    expect(el.tagName).toBe('A');
    expect(el).toHaveClass('ms-stack', 'extra');
    expect(el).toHaveAttribute('href', '#section-x');
    expect(el.style.getPropertyValue('--ms-stack-gap')).toBe('var(--ms-space-2)');
    expect(ref.current).toBe(el);
  });

  it('...rest 透传原生属性与事件到根;ref 指向根;用户 style 与 className 保留', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Stack
        ref={ref}
        id="stk"
        data-foo="bar"
        className="custom"
        style={{ opacity: 0.5 }}
        data-testid="s"
      >
        a
      </Stack>,
    );
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('id', 'stk');
    expect(el).toHaveAttribute('data-foo', 'bar');
    expect(el).toHaveClass('ms-stack', 'custom');
    expect(el.style.opacity).toBe('0.5');
    // 布局变量仍注入
    expect(el.style.getPropertyValue('--ms-stack-dir')).toBe('column');
    expect(ref.current).toBe(el);
  });
});
