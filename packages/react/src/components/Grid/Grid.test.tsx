// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Grid, GridItem } from './Grid';
import {
  isResponsiveObject,
  normalizeResponsive,
  resolveColumns,
  resolveMinChildWidth,
  resolveSpace,
  resolveSpan,
  resolveStart,
  spreadResponsive,
} from './logic';

describe('Grid logic（纯逻辑层）', () => {
  it('resolveColumns:数字 → 等宽 repeat(minmax(0,1fr));字符串原样', () => {
    expect(resolveColumns(3)).toBe('repeat(3, minmax(0, 1fr))');
    expect(resolveColumns('1fr auto 2fr')).toBe('1fr auto 2fr');
  });

  it('resolveSpace:数字档位 → --ms-space-N;0 → 0;字符串原样', () => {
    expect(resolveSpace(4)).toBe('var(--ms-space-4)');
    expect(resolveSpace(0)).toBe('0');
    expect(resolveSpace('2ch')).toBe('2ch');
  });

  it('resolveMinChildWidth:auto-fit + minmax(min(100%, w), 1fr)', () => {
    expect(resolveMinChildWidth('12rem')).toBe('repeat(auto-fit, minmax(min(100%, 12rem), 1fr))');
    expect(resolveMinChildWidth(8)).toBe(
      'repeat(auto-fit, minmax(min(100%, var(--ms-space-8)), 1fr))',
    );
  });

  it('resolveSpan / resolveStart:数字 → span N / 网格线;关键字原样', () => {
    expect(resolveSpan(2)).toBe('span 2');
    expect(resolveSpan('auto')).toBe('auto');
    expect(resolveStart(3)).toBe('3');
    expect(resolveStart('auto')).toBe('auto');
  });

  it('isResponsiveObject / normalizeResponsive:单值落 base,断点对象保留', () => {
    expect(isResponsiveObject(2)).toBe(false);
    expect(isResponsiveObject({ base: 1, md: 2 })).toBe(true);
    // 无合法断点键的普通对象不算响应式
    expect(isResponsiveObject({ foo: 1 } as never)).toBe(false);
    expect(normalizeResponsive(2)).toEqual({ base: 2 });
    expect(normalizeResponsive({ base: 1, lg: 4 })).toEqual({ base: 1, lg: 4 });
    expect(normalizeResponsive(undefined)).toEqual({});
  });

  it('spreadResponsive:只为提供的断点写 --ms-grid-<key>-<bp> 变量', () => {
    const vars = spreadResponsive('cols', { base: 1, md: 3 }, resolveColumns);
    expect(vars).toEqual({
      '--ms-grid-cols-base': 'repeat(1, minmax(0, 1fr))',
      '--ms-grid-cols-md': 'repeat(3, minmax(0, 1fr))',
    });
    // 未提供的断点不产出变量(由 CSS fallback 链级联)
    expect(vars['--ms-grid-cols-sm']).toBeUndefined();
  });
});

describe('Grid 组件', () => {
  it('默认渲染 <div>.ms-grid;单值 columns/gap 注入 base CSS 变量', () => {
    render(
      <Grid columns={4} gap={4} data-testid="g">
        <span>a</span>
      </Grid>,
    );
    const el = screen.getByTestId('g');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ms-grid');
    expect(el.style.getPropertyValue('--ms-grid-cols-base')).toBe('repeat(4, minmax(0, 1fr))');
    expect(el.style.getPropertyValue('--ms-grid-gap-base')).toBe('var(--ms-space-4)');
  });

  it('响应式 columns 对象:逐断点注入 cols 变量', () => {
    render(<Grid columns={{ base: 1, md: 2, lg: 4 }} data-testid="g" />);
    const el = screen.getByTestId('g');
    expect(el.style.getPropertyValue('--ms-grid-cols-base')).toBe('repeat(1, minmax(0, 1fr))');
    expect(el.style.getPropertyValue('--ms-grid-cols-md')).toBe('repeat(2, minmax(0, 1fr))');
    expect(el.style.getPropertyValue('--ms-grid-cols-lg')).toBe('repeat(4, minmax(0, 1fr))');
  });

  it('minChildWidth 优先驱动列模板(覆盖 columns);inline/container 反映到类名', () => {
    render(<Grid columns={6} minChildWidth="10rem" inline container data-testid="g" />);
    const el = screen.getByTestId('g');
    expect(el.style.getPropertyValue('--ms-grid-cols-base')).toBe(
      'repeat(auto-fit, minmax(min(100%, 10rem), 1fr))',
    );
    expect(el).toHaveClass('ms-grid--inline', 'ms-grid--container');
  });

  it('多态 as:渲染为指定语义标签;align/justify/autoFlow 注入变量', () => {
    render(
      <Grid as="section" align="center" justify="end" autoFlow="column dense" data-testid="g" />,
    );
    const el = screen.getByTestId('g');
    expect(el.tagName).toBe('SECTION');
    expect(el.style.getPropertyValue('--ms-grid-align-base')).toBe('center');
    expect(el.style.getPropertyValue('--ms-grid-justify-base')).toBe('end');
    expect(el.style.getPropertyValue('--ms-grid-flow-base')).toBe('column dense');
  });

  it('asChild:样式/类合并到子元素,事件 compose,ref 指向子元素真实 DOM', () => {
    const ref = createRef<HTMLDivElement>();
    let clicked = 0;
    render(
      <Grid asChild columns={2} ref={ref}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: 测试用静态节点 */}
        <ul className="own" onClick={() => clicked++} data-testid="g">
          <li>x</li>
        </ul>
      </Grid>,
    );
    const el = screen.getByTestId('g');
    expect(el.tagName).toBe('UL');
    expect(el).toHaveClass('ms-grid', 'own');
    expect(el.style.getPropertyValue('--ms-grid-cols-base')).toBe('repeat(2, minmax(0, 1fr))');
    el.click();
    expect(clicked).toBe(1);
    expect(ref.current).toBe(el);
  });

  it('...rest 透传原生属性/事件到根;ref 指向根;用户 style 优先', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Grid
        ref={ref}
        id="grid-1"
        data-foo="bar"
        gap={2}
        style={{ opacity: 0.5 }}
        data-testid="g"
      />,
    );
    const el = screen.getByTestId('g');
    expect(el).toHaveAttribute('id', 'grid-1');
    expect(el).toHaveAttribute('data-foo', 'bar');
    expect(el.style.opacity).toBe('0.5');
    // 核心样式变量仍注入
    expect(el.style.getPropertyValue('--ms-grid-gap-base')).toBe('var(--ms-space-2)');
    expect(ref.current).toBe(el);
  });
});

describe('Grid.Item 子部件', () => {
  it('Grid.Item 等价具名 GridItem;colSpan/rowSpan(数字→span)/colStart 注入变量', () => {
    expect(Grid.Item).toBe(GridItem);
    render(
      <Grid.Item colSpan={2} rowSpan={3} colStart={1} alignSelf="end" data-testid="i">
        cell
      </Grid.Item>,
    );
    const el = screen.getByTestId('i');
    expect(el).toHaveClass('ms-grid__item');
    expect(el.style.getPropertyValue('--ms-grid-item-col-span-base')).toBe('span 2');
    expect(el.style.getPropertyValue('--ms-grid-item-row-span-base')).toBe('span 3');
    expect(el.style.getPropertyValue('--ms-grid-item-col-start-base')).toBe('1');
    expect(el.style.getPropertyValue('--ms-grid-item-align-self-base')).toBe('end');
  });

  it('Grid.Item 响应式 colSpan:逐断点注入', () => {
    render(<Grid.Item colSpan={{ base: 12, md: 6 }} data-testid="i" />);
    const el = screen.getByTestId('i');
    expect(el.style.getPropertyValue('--ms-grid-item-col-span-base')).toBe('span 12');
    expect(el.style.getPropertyValue('--ms-grid-item-col-span-md')).toBe('span 6');
  });

  it('Grid.Item 多态 as=li 与 ...rest 透传', () => {
    const ref = createRef<HTMLLIElement>();
    render(<Grid.Item as="li" ref={ref as never} data-x="1" data-testid="i" />);
    const el = screen.getByTestId('i');
    expect(el.tagName).toBe('LI');
    expect(el).toHaveAttribute('data-x', '1');
  });
});
